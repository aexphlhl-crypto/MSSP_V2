package com.mspportal.monitoring.service;

import com.mspportal.monitoring.dto.DeviceMetricResponse;
import com.mspportal.monitoring.entity.DeviceMetric;
import com.mspportal.monitoring.repository.DeviceMetricRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import java.time.Instant;
import java.util.Collections;

@Service
public class MetricService {

    private final DeviceMetricRepository metricRepository;
    private final DeviceRepository deviceRepository;
    private final MonitoringServiceHelper helper;
    private final ProviderResourceMappingRepository mappingRepository;
    private final MonitoringProviderRegistry monitoringProviderRegistry;

    public MetricService(DeviceMetricRepository metricRepository,
                         DeviceRepository deviceRepository,
                         MonitoringServiceHelper helper,
                         ProviderResourceMappingRepository mappingRepository,
                         MonitoringProviderRegistry monitoringProviderRegistry) {
        this.metricRepository = metricRepository;
        this.deviceRepository = deviceRepository;
        this.helper = helper;
        this.mappingRepository = mappingRepository;
        this.monitoringProviderRegistry = monitoringProviderRegistry;
    }

    @Transactional(readOnly = true)
    public List<DeviceMetricResponse> getDeviceMetrics(UUID deviceId, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            deviceRepository.findById(deviceId).orElseThrow(() -> new RuntimeException("Device not found"));
            
            List<DeviceMetricResponse> list = metricRepository.findByDeviceIdOrderByCollectedAtDesc(deviceId, PageRequest.of(0, 50))
                    .getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

            if (list.isEmpty()) {
                DeviceMetricResponse latest = getLatestMetric(deviceId, null);
                if (latest != null) {
                    return Collections.singletonList(latest);
                }
            }
            return list;
        });
    }

    @Transactional(readOnly = true)
    public List<DeviceMetricResponse> getDeviceMetricsSince(UUID deviceId, java.time.Instant since, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            deviceRepository.findById(deviceId).orElseThrow(() -> new RuntimeException("Device not found"));
            return metricRepository.findByDeviceIdAndCollectedAtAfterOrderByCollectedAtAsc(deviceId, since)
                    .stream().map(this::mapToResponse).collect(java.util.stream.Collectors.toList());
        });
    }

    @Transactional(readOnly = true)
    public DeviceMetricResponse getLatestMetric(UUID deviceId, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            deviceRepository.findById(deviceId).orElseThrow(() -> new RuntimeException("Device not found"));

            DeviceMetricResponse dbResponse = metricRepository.findFirstByDeviceIdOrderByCollectedAtDesc(deviceId)
                    .map(this::mapToResponse)
                    .orElse(null);

            List<ProviderResourceMapping> mappings = mappingRepository.findByInternalResourceIdAndResourceTypeNative(deviceId, ProviderResourceType.DEVICE.name());
            org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Found mappings: {} for device {}", mappings.size(), deviceId);
            for (ProviderResourceMapping mapping : mappings) {
                if (mapping.getProviderConnection() == null) {
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Connection is null for mapping {}", mapping.getId());
                    continue;
                }

                java.util.Optional<MonitoringProvider> providerOpt =
                        monitoringProviderRegistry.resolve(mapping.getProviderConnection().getProviderName());

                if (providerOpt.isEmpty()) {
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Provider not resolved: {}", mapping.getProviderConnection().getProviderName());
                    continue;
                }

                try {
                    MonitoringProvider provider = providerOpt.get();
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Using provider: {}", provider.getProviderName());
                    List<com.mspportal.integrationcore.dto.NormalizedMetric> metricsList =
                            provider.getMetrics(mapping.getProviderConnection().getId(), mapping.getExternalResourceId());
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Metrics fetched count: {}", metricsList.size());

                    Double cpu = null, mem = null, disk = null, netIn = null, netOut = null, uptime = null;
                    for (com.mspportal.integrationcore.dto.NormalizedMetric nm : metricsList) {
                        if ("CPU".equalsIgnoreCase(nm.getMetricName())) cpu = nm.getValue();
                        if ("Memory".equalsIgnoreCase(nm.getMetricName())) mem = nm.getValue();
                        if ("Disk".equalsIgnoreCase(nm.getMetricName())) disk = nm.getValue();
                        if ("NetworkIn".equalsIgnoreCase(nm.getMetricName())) netIn = nm.getValue();
                        if ("NetworkOut".equalsIgnoreCase(nm.getMetricName())) netOut = nm.getValue();
                        if ("Uptime".equalsIgnoreCase(nm.getMetricName())) uptime = nm.getValue();
                    }
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).info("[TRACE-METRIC] Parsed CPU={} MEM={} DISK={} NET_IN={} NET_OUT={} UPTIME={}", cpu, mem, disk, netIn, netOut, uptime);

                    if (cpu != null || mem != null || disk != null || netIn != null || netOut != null || uptime != null) {
                        DeviceMetricResponse dynamicResp = new DeviceMetricResponse();
                        dynamicResp.setDeviceId(deviceId);
                        dynamicResp.setCollectedAt(Instant.now());
                        dynamicResp.setCpuUsage(cpu);
                        dynamicResp.setMemoryUsage(mem);
                        dynamicResp.setDiskUsage(disk);
                        dynamicResp.setNetworkIn(netIn != null ? netIn.longValue() : null);
                        dynamicResp.setNetworkOut(netOut != null ? netOut.longValue() : null);
                        dynamicResp.setUptimeSeconds(uptime != null ? uptime.longValue() : null);
                        return dynamicResp;
                    }
                } catch (Exception e) {
                    org.slf4j.LoggerFactory.getLogger(MetricService.class).error("[TRACE-METRIC] Exception: {}", e.getMessage(), e);
                }
            }
            return dbResponse;
        });
    }

    public DeviceMetricResponse mapToResponse(DeviceMetric m) {
        DeviceMetricResponse r = new DeviceMetricResponse();
        r.setId(m.getId());
        r.setTenantId(m.getTenantId());
        r.setDeviceId(m.getDeviceId());
        r.setCollectedAt(m.getCollectedAt());
        r.setCpuUsage(m.getCpuUsage());
        r.setMemoryUsage(m.getMemoryUsage());
        r.setDiskUsage(m.getDiskUsage());
        r.setNetworkIn(m.getNetworkIn());
        r.setNetworkOut(m.getNetworkOut());
        r.setUptimeSeconds(m.getUptimeSeconds());
        return r;
    }
}
