package com.mspportal.monitoring.service;

import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import com.mspportal.integrationcore.service.ProviderResourceMappingService;
import com.mspportal.monitoring.dto.*;
import com.mspportal.monitoring.entity.Device;
import com.mspportal.monitoring.entity.DeviceMetric;
import com.mspportal.monitoring.entity.Alert;
import com.mspportal.monitoring.enums.AlertSeverity;
import com.mspportal.monitoring.enums.AlertStatus;
import com.mspportal.monitoring.repository.AlertRepository;
import com.mspportal.monitoring.repository.DeviceMetricRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.monitoring.repository.SiteRepository;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import com.mspportal.integrationcore.provider.ProviderNotRegisteredException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeviceService {

    private static final Logger log = LoggerFactory.getLogger(DeviceService.class);

    private final DeviceRepository deviceRepository;
    private final SiteRepository siteRepository;
    private final AlertRepository alertRepository;
    private final DeviceMetricRepository deviceMetricRepository;
    private final ProviderResourceMappingService providerResourceMappingService;
    private final com.mspportal.integrationcore.repository.ProviderResourceMappingRepository mappingRepository;
    private final ProviderRawDataRepository rawDataRepository;
    private final DeviceProviderDataMapper deviceProviderDataMapper;
    private final MonitoringServiceHelper helper;
    private final MonitoringProviderRegistry monitoringProviderRegistry;
    private final ProviderConnectionRepository providerConnectionRepository;

    public DeviceService(DeviceRepository deviceRepository,
                         SiteRepository siteRepository,
                         AlertRepository alertRepository,
                         DeviceMetricRepository deviceMetricRepository,
                         ProviderResourceMappingService providerResourceMappingService,
                         com.mspportal.integrationcore.repository.ProviderResourceMappingRepository mappingRepository,
                         ProviderRawDataRepository rawDataRepository,
                         DeviceProviderDataMapper deviceProviderDataMapper,
                         MonitoringServiceHelper helper,
                         MonitoringProviderRegistry monitoringProviderRegistry,
                         ProviderConnectionRepository providerConnectionRepository) {
        this.deviceRepository = deviceRepository;
        this.siteRepository = siteRepository;
        this.alertRepository = alertRepository;
        this.deviceMetricRepository = deviceMetricRepository;
        this.providerResourceMappingService = providerResourceMappingService;
        this.mappingRepository = mappingRepository;
        this.rawDataRepository = rawDataRepository;
        this.deviceProviderDataMapper = deviceProviderDataMapper;
        this.helper = helper;
        this.monitoringProviderRegistry = monitoringProviderRegistry;
        this.providerConnectionRepository = providerConnectionRepository;
    }

    @Transactional
    public com.mspportal.monitoring.dto.ImportDeviceResult importDevices(com.mspportal.monitoring.dto.ImportDeviceRequest request, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            // Verify site exists and belongs to this tenant
            if (request.getSiteId() != null) {
                siteRepository.findById(request.getSiteId()).orElseThrow(() -> new RuntimeException("Site not found"));
            }

            int newlyCreated = 0;
            int updated = 0;
            int alreadyImported = 0;
            int failed = 0;

            for (com.mspportal.integrationcore.dto.DiscoveredResource res : request.getResources()) {
                try {
                    java.util.Optional<com.mspportal.integrationcore.entity.ProviderResourceMapping> mappingOpt = 
                        mappingRepository.findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                            request.getProviderConnectionId(), ProviderResourceType.DEVICE, res.getExternalId());
                    
                    Device device;
                    if (mappingOpt.isPresent()) {
                        com.mspportal.integrationcore.entity.ProviderResourceMapping mapping = mappingOpt.get();
                        device = deviceRepository.findById(mapping.getInternalResourceId()).orElse(null);
                        
                        if (device != null) {
                            // Device exists, update it with provider data only if provider gave it
                            if (res.getName() != null) device.setHostname(res.getName());
                            
                            String ipAddress = res.getRawProperties() != null ? (String) res.getRawProperties().get("ipAddress") : null;
                            if (ipAddress != null) device.setIpAddress(ipAddress);
                            
                            if (res.getType() != null) {
                                try {
                                    device.setDeviceType(com.mspportal.monitoring.enums.DeviceType.valueOf(res.getType().toUpperCase()));
                                } catch(Exception e) {
                                    device.setDeviceType(com.mspportal.monitoring.enums.DeviceType.OTHER);
                                }
                            }
                            
                            String status = res.getRawProperties() != null ? (String) res.getRawProperties().get("status") : null;
                            if (status != null) {
                                try {
                                    device.setStatus(com.mspportal.monitoring.enums.DeviceStatus.valueOf(status.toUpperCase()));
                                } catch(Exception e) {
                                    device.setStatus(com.mspportal.monitoring.enums.DeviceStatus.UNKNOWN);
                                }
                            }
                            deviceRepository.saveAndFlush(device);
                            
                            providerResourceMappingService.upsert(
                                request.getProviderConnectionId(), ProviderResourceType.DEVICE,
                                res.getExternalId(), null, device.getId());
                                
                            alreadyImported++;
                            continue;
                        }
                    }
                    
                    // Not found or device was deleted
                    device = new Device();
                    device.setSiteId(request.getSiteId()); // Only apply MSP-owned site if new
                    device.setHostname(res.getName() != null ? res.getName() : "Unknown");
                    device.setDisplayName(res.getName() != null ? res.getName() : device.getHostname());
                    
                    String ipAddress = res.getRawProperties() != null ? (String) res.getRawProperties().get("ipAddress") : null;
                    device.setIpAddress(ipAddress);
                    
                    if (res.getType() != null) {
                        try {
                            device.setDeviceType(com.mspportal.monitoring.enums.DeviceType.valueOf(res.getType().toUpperCase()));
                        } catch(Exception e) {
                            device.setDeviceType(com.mspportal.monitoring.enums.DeviceType.OTHER);
                        }
                    } else {
                        device.setDeviceType(com.mspportal.monitoring.enums.DeviceType.OTHER);
                    }
                    
                    String status = res.getRawProperties() != null ? (String) res.getRawProperties().get("status") : null;
                    if (status != null) {
                        try {
                            device.setStatus(com.mspportal.monitoring.enums.DeviceStatus.valueOf(status.toUpperCase()));
                        } catch(Exception e) {
                            device.setStatus(com.mspportal.monitoring.enums.DeviceStatus.UNKNOWN);
                        }
                    } else {
                        device.setStatus(com.mspportal.monitoring.enums.DeviceStatus.UNKNOWN);
                    }
                    
                    device.setMonitoringEnabled(true);
                    
                    Device saved = deviceRepository.saveAndFlush(device);
                    
                    log.info("[MAPPING] deviceId={}, resourceType=DEVICE, externalHostId={}, connectionId={}",
                            saved.getId(), res.getExternalId(), request.getProviderConnectionId());

                    providerResourceMappingService.upsert(
                        request.getProviderConnectionId(), ProviderResourceType.DEVICE,
                        res.getExternalId(), null, saved.getId());
                        
                    newlyCreated++;
                    
                } catch (Exception e) {
                    log.error("Failed to import resource {}: {}", res.getExternalId(), e.getMessage(), e);
                    failed++;
                }
            }

            log.info("[SYNC] connectionId={}, provider=ZABBIX, discoveredHosts={}, importedDevices={}",
                    request.getProviderConnectionId(), "ZABBIX", request.getResources().size(), newlyCreated);

            try {
                log.info("[SYNC] Triggering syncProviderData for connectionId={}", request.getProviderConnectionId());
                syncProviderData(request.getProviderConnectionId());
            } catch (ProviderNotRegisteredException e) {
                log.warn("syncProviderData skipped after import: {}", e.getMessage());
            } catch (Exception e) {
                log.warn("syncProviderData failed after import: {}", e.getMessage(), e);
            }

            return new com.mspportal.monitoring.dto.ImportDeviceResult(newlyCreated, updated, alreadyImported, failed);
        });
    }

    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            // Verify site exists and belongs to this tenant
            if (request.getSiteId() != null) {
                siteRepository.findById(request.getSiteId()).orElseThrow(() -> new RuntimeException("Site not found"));
            }

            Device device = new Device();
            device.setSiteId(request.getSiteId());
            device.setHostname(request.getHostname());
            device.setDisplayName(request.getDisplayName());
            device.setIpAddress(request.getIpAddress());
            device.setDeviceType(request.getDeviceType());
            device.setOperatingSystem(request.getOperatingSystem());
            device.setStatus(request.getStatus());
            device.setMonitoringEnabled(request.isMonitoringEnabled());

            Device saved = deviceRepository.save(device);
            return mapToResponse(saved);
        });
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> listDevices(String requestedTenantId, UUID siteId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            List<Device> devices;
            if (siteId != null) {
                // Since Device extends BaseTenantEntity, this is implicitly scoped to the active tenant
                devices = deviceRepository.findBySiteId(siteId);
            } else {
                devices = deviceRepository.findAll();
            }
            return devices.stream().map(this::mapToResponse).collect(Collectors.toList());
        });
    }

    @Transactional(readOnly = true)
    public DeviceResponse getDevice(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Device device = deviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Device not found"));
            return mapToResponse(device);
        });
    }

    /**
     * Returns an enriched DeviceDetailResponse by loading the base device data
     * and then extracting additional fields from ProviderRawData payloads.
     * Only populates sections that the connected provider actually exposes.
     */
    @Transactional(readOnly = true)
    public DeviceDetailResponse getDeviceDetail(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Device device = deviceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Device not found"));

            // Build base response
            DeviceResponse base = mapToResponse(device);
            DeviceDetailResponse detail = new DeviceDetailResponse();

            // Copy all base fields
            detail.setId(base.getId());
            detail.setTenantId(base.getTenantId());
            detail.setSiteId(base.getSiteId());
            detail.setSiteName(base.getSiteName());
            detail.setHostname(base.getHostname());
            detail.setDisplayName(base.getDisplayName());
            detail.setIpAddress(base.getIpAddress());
            detail.setDeviceType(base.getDeviceType());
            detail.setOperatingSystem(base.getOperatingSystem());
            detail.setStatus(base.getStatus());
            detail.setMonitoringEnabled(base.isMonitoringEnabled());
            detail.setLastSeenAt(base.getLastSeenAt());
            detail.setCreatedAt(base.getCreatedAt());
            detail.setUpdatedAt(base.getUpdatedAt());
            detail.setAlertCount(base.getAlertCount());
            detail.setCriticalAlertCount(base.getCriticalAlertCount());
            detail.setWarningAlertCount(base.getWarningAlertCount());
            detail.setCpuUsage(base.getCpuUsage());
            detail.setMemoryUsage(base.getMemoryUsage());
            detail.setDiskUsage(base.getDiskUsage());
            detail.setProviderMappings(base.getProviderMappings());

            // Accumulate capabilities
            Set<String> capabilitySet = new LinkedHashSet<>();
            capabilitySet.add(ProviderCapability.DEVICE_CORE.name());

            // Infer from existing base data
            if (base.getCpuUsage() != null || base.getMemoryUsage() != null || base.getDiskUsage() != null) {
                capabilitySet.add(ProviderCapability.DEVICE_METRICS.name());
            }
            if (base.getAlertCount() > 0) {
                capabilitySet.add(ProviderCapability.DEVICE_ALERTS.name());
            }

            // Enrich from ProviderRawData for each provider mapping
            List<ProviderResourceMapping> mappings =
                    mappingRepository.findByInternalResourceIdAndResourceType(id, ProviderResourceType.DEVICE);

            // Build activity events from mapping metadata
            List<ActivityEvent> activityEvents = new ArrayList<>();
            for (ProviderResourceMapping mapping : mappings) {
                try {
                    com.mspportal.integrationcore.entity.ProviderConnection conn = mapping.getProviderConnection();
                    if (conn == null) continue;

                    // Add activity event for the sync
                    if (mapping.getLastSyncedAt() != null) {
                        ActivityEvent syncEvent = new ActivityEvent();
                        syncEvent.setTimestamp(mapping.getLastSyncedAt());
                        syncEvent.setEventType("SYNC");
                        syncEvent.setActor(conn.getDisplayName() != null ? conn.getDisplayName() : conn.getProviderName());
                        syncEvent.setDescription("Device synchronized from " + conn.getProviderName());
                        activityEvents.add(syncEvent);
                    }

                    // Enrich from latest raw data for this provider resource
                    rawDataRepository.findFirstByProviderConnectionIdAndProviderObjectIdOrderByCollectedAtDesc(
                                    conn.getId(), mapping.getExternalResourceId())
                            .ifPresent(rawData -> deviceProviderDataMapper.enrich(
                                    detail, rawData, conn.getCapabilities(), capabilitySet));

                } catch (Exception e) {
                    // Don't fail entire response if one mapping fails to enrich
                }
            }

            if (!activityEvents.isEmpty()) {
                activityEvents.sort(Comparator.comparing(ActivityEvent::getTimestamp).reversed());
                detail.setActivityEvents(activityEvents);
                capabilitySet.add(ProviderCapability.DEVICE_ACTIVITY.name());
            }

            detail.setCapabilities(capabilitySet);
            return detail;
        });
    }

    @Transactional
    public DeviceResponse updateDevice(UUID id, UpdateDeviceRequest request, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Device device = deviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Device not found"));
            
            if (request.getSiteId() != null) {
                siteRepository.findById(request.getSiteId()).orElseThrow(() -> new RuntimeException("Site not found"));
                device.setSiteId(request.getSiteId());
            }
            if (request.getHostname() != null) device.setHostname(request.getHostname());
            if (request.getDisplayName() != null) device.setDisplayName(request.getDisplayName());
            if (request.getIpAddress() != null) device.setIpAddress(request.getIpAddress());
            if (request.getDeviceType() != null) device.setDeviceType(request.getDeviceType());
            if (request.getOperatingSystem() != null) device.setOperatingSystem(request.getOperatingSystem());
            if (request.getStatus() != null) device.setStatus(request.getStatus());
            device.setMonitoringEnabled(request.isMonitoringEnabled());

            Device saved = deviceRepository.save(device);
            return mapToResponse(saved);
        });
    }

    @Transactional
    public void deleteDevice(UUID id, String requestedTenantId) {
        helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Device device = deviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Device not found"));
            deviceRepository.delete(device);
            return null;
        });
    }

    public DeviceResponse mapToResponse(Device d) {
        DeviceResponse r = new DeviceResponse();
        r.setId(d.getId());
        r.setTenantId(d.getTenantId());
        r.setSiteId(d.getSiteId());
        r.setHostname(d.getHostname());
        r.setDisplayName(d.getDisplayName());
        r.setIpAddress(d.getIpAddress());
        r.setDeviceType(d.getDeviceType());
        r.setOperatingSystem(d.getOperatingSystem());
        r.setStatus(d.getStatus());
        r.setMonitoringEnabled(d.isMonitoringEnabled());
        r.setLastSeenAt(d.getLastSeenAt());
        r.setCreatedAt(d.getCreatedAt());
        r.setUpdatedAt(d.getUpdatedAt());
        
        if (d.getSiteId() != null) {
            siteRepository.findById(d.getSiteId()).ifPresent(s -> r.setSiteName(s.getName()));
        }
        
        List<UUID> idList = Collections.singletonList(d.getId());
        r.setAlertCount(alertRepository.countByDeviceIdInAndStatus(idList, AlertStatus.OPEN));
        r.setCriticalAlertCount(alertRepository.countByDeviceIdInAndStatusAndSeverity(idList, AlertStatus.OPEN, AlertSeverity.CRITICAL));
        r.setWarningAlertCount(alertRepository.countByDeviceIdInAndStatusAndSeverity(idList, AlertStatus.OPEN, AlertSeverity.WARNING));
        
        deviceMetricRepository.findFirstByDeviceIdOrderByCollectedAtDesc(d.getId())
                .ifPresent(m -> {
                    r.setCpuUsage(m.getCpuUsage());
                    r.setMemoryUsage(m.getMemoryUsage());
                    r.setDiskUsage(m.getDiskUsage());
                });

        try {
            List<ProviderResourceMapping> deviceMappings = mappingRepository.findByInternalResourceIdAndResourceType(d.getId(), ProviderResourceType.DEVICE);
            for (ProviderResourceMapping mapping : deviceMappings) {
                if (mapping.getProviderConnection() != null) {
                    monitoringProviderRegistry.resolve(mapping.getProviderConnection().getProviderName())
                            .ifPresent(provider -> {
                                List<com.mspportal.integrationcore.dto.NormalizedMetric> metricsList =
                                        provider.getMetrics(mapping.getProviderConnection().getId(), mapping.getExternalResourceId());
                                for (com.mspportal.integrationcore.dto.NormalizedMetric nm : metricsList) {
                                    if ("CPU".equalsIgnoreCase(nm.getMetricName())) r.setCpuUsage(nm.getValue());
                                    if ("Memory".equalsIgnoreCase(nm.getMetricName())) r.setMemoryUsage(nm.getValue());
                                    if ("Disk".equalsIgnoreCase(nm.getMetricName())) r.setDiskUsage(nm.getValue());
                                }
                            });
                }
            }
        } catch (Exception e) {
            // ignore
        }
                
        List<ProviderResourceMapping> mappings = providerResourceMappingService.getMappingsForResource(ProviderResourceType.DEVICE, d.getId());
        r.setProviderMappings(mappings.stream().map(m -> {
            ProviderMappingSummary pms = new ProviderMappingSummary();
            pms.setProviderConnectionId(m.getProviderConnection().getId());
            pms.setProviderName(m.getProviderConnection().getProviderName());
            pms.setProviderDisplayName(m.getProviderConnection().getProviderName());
            pms.setProviderType(m.getProviderConnection().getProviderType().name());
            pms.setExternalResourceId(m.getExternalResourceId());
            pms.setSyncStatus(m.getSyncStatus().name());
            pms.setLastSyncedAt(m.getLastSyncedAt());
            return pms;
        }).collect(Collectors.toList()));
        
        return r;
    }

    @Transactional
    public void syncProviderData(UUID connectionId) {
        com.mspportal.integrationcore.entity.ProviderConnection conn = providerConnectionRepository.findByIdNative(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("ProviderConnection not found: " + connectionId));

        // Explicit failure: if the provider is not registered, this is a configuration error.
        // Callers should not silently succeed when data sync is impossible.
        com.mspportal.integrationcore.provider.MonitoringProvider provider =
                monitoringProviderRegistry.resolveOrThrow(conn.getProviderName());

        List<ProviderResourceMapping> deviceMappings = mappingRepository.findByProviderConnectionIdAndResourceType(connectionId, ProviderResourceType.DEVICE);
        log.info("[SYNC] Found {} device mappings for sync connectionId={}", deviceMappings.size(), connectionId);
        for (ProviderResourceMapping mapping : deviceMappings) {
            String extId = mapping.getExternalResourceId();
            UUID deviceId = mapping.getInternalResourceId();
            log.info("[SYNC] Processing deviceId={}, externalHostId={}", deviceId, extId);
            
            // 1. Sync Metrics
            try {
                List<com.mspportal.integrationcore.dto.NormalizedMetric> metricsList = provider.getMetrics(connectionId, extId);
                log.info("[METRICS] hostId={}, rawItems={}, normalizedMetrics={}", extId, metricsList.size(), metricsList.size());
                Double cpu = null, mem = null, disk = null, netIn = null, netOut = null, uptime = null;
                for (com.mspportal.integrationcore.dto.NormalizedMetric nm : metricsList) {
                    log.info("[METRIC DATA] name={}, value={}, unit={}, timestamp={}", nm.getMetricName(), nm.getValue(), nm.getUnit(), nm.getTimestamp());
                    if ("CPU".equalsIgnoreCase(nm.getMetricName())) cpu = nm.getValue();
                    if ("Memory".equalsIgnoreCase(nm.getMetricName())) mem = nm.getValue();
                    if ("Disk".equalsIgnoreCase(nm.getMetricName())) disk = nm.getValue();
                    if ("NetworkIn".equalsIgnoreCase(nm.getMetricName())) netIn = nm.getValue();
                    if ("NetworkOut".equalsIgnoreCase(nm.getMetricName())) netOut = nm.getValue();
                    if ("Uptime".equalsIgnoreCase(nm.getMetricName())) uptime = nm.getValue();
                }
                
                if (cpu != null || mem != null || disk != null || netIn != null || netOut != null || uptime != null) {
                    DeviceMetric metric = new DeviceMetric();
                    metric.setDeviceId(deviceId);
                    metric.setCollectedAt(Instant.now());
                    metric.setCpuUsage(cpu);
                    metric.setMemoryUsage(mem);
                    metric.setDiskUsage(disk);
                    metric.setNetworkIn(netIn != null ? netIn.longValue() : null);
                    metric.setNetworkOut(netOut != null ? netOut.longValue() : null);
                    metric.setUptimeSeconds(uptime != null ? uptime.longValue() : null);
                    deviceMetricRepository.save(metric);
                    log.info("[METRIC PERSISTENCE] deviceId={}, savedMetrics=1", deviceId);
                } else {
                    log.info("[METRIC PERSISTENCE] deviceId={}, savedMetrics=0", deviceId);
                }
            } catch (Exception e) {
                log.error("Failed to sync metrics for device mapping {}: {}", extId, e.getMessage(), e);
            }
            
            // 2. Sync Alerts
            try {
                List<com.mspportal.integrationcore.dto.NormalizedAlert> alertsList = provider.getAlerts(connectionId, extId);
                log.info("[ALERTS] hostId={}, rawProblems={}, normalizedAlerts={}", extId, alertsList.size(), alertsList.size());
                int savedAlertsCount = 0;
                for (com.mspportal.integrationcore.dto.NormalizedAlert na : alertsList) {
                    log.info("[ALERT DATA] externalId={}, title={}, severity={}, status={}", na.getExternalId(), na.getTitle(), na.getSeverity(), na.getStatus());
                    Optional<ProviderResourceMapping> alertMappingOpt = mappingRepository.findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                            connectionId, ProviderResourceType.ALERT, na.getExternalId());
                            
                    if (alertMappingOpt.isPresent()) {
                        ProviderResourceMapping alertMapping = alertMappingOpt.get();
                        Alert alert = alertRepository.findById(alertMapping.getInternalResourceId()).orElse(null);
                        if (alert != null) {
                            if ("RESOLVED".equalsIgnoreCase(na.getStatus()) && alert.getStatus() != com.mspportal.monitoring.enums.AlertStatus.RESOLVED) {
                                alert.setStatus(com.mspportal.monitoring.enums.AlertStatus.RESOLVED);
                                alert.setResolvedAt(na.getRecoveredAt() != null ? na.getRecoveredAt() : Instant.now());
                                alertRepository.save(alert);
                                savedAlertsCount++;
                            }
                        }
                    } else {
                        if ("OPEN".equalsIgnoreCase(na.getStatus())) {
                            Alert alert = new Alert();
                            alert.setDeviceId(deviceId);
                            alert.setType(na.getSource());
                            
                            com.mspportal.monitoring.enums.AlertSeverity severity = com.mspportal.monitoring.enums.AlertSeverity.INFO;
                            try {
                                severity = com.mspportal.monitoring.enums.AlertSeverity.valueOf(na.getSeverity().toUpperCase());
                            } catch (Exception e) {
                                // fallback
                            }
                            alert.setSeverity(severity);
                            alert.setTitle(na.getTitle());
                            alert.setMessage(na.getDescription());
                            alert.setStatus(com.mspportal.monitoring.enums.AlertStatus.OPEN);
                            alert.setResolvedAt(null);
                            
                            Alert savedAlert = alertRepository.save(alert);
                            savedAlertsCount++;
                            
                            providerResourceMappingService.upsert(connectionId, ProviderResourceType.ALERT, na.getExternalId(), "SYNCED", savedAlert.getId());
                        }
                    }
                }
                log.info("[ALERT PERSISTENCE] deviceId={}, savedAlerts={}", deviceId, savedAlertsCount);
            } catch (Exception e) {
                log.error("Failed to sync alerts for device mapping {}: {}", extId, e.getMessage(), e);
            }
        }
    }
}
