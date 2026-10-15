package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import com.mspportal.monitoring.entity.Alert;
import com.mspportal.monitoring.entity.DeviceMetric;
import com.mspportal.monitoring.enums.AlertSeverity;
import com.mspportal.monitoring.enums.AlertStatus;
import com.mspportal.monitoring.repository.AlertRepository;
import com.mspportal.monitoring.repository.DeviceMetricRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class MonitoringPollingScheduler {

    private static final Logger log = LoggerFactory.getLogger(MonitoringPollingScheduler.class);

    private final ProviderResourceMappingRepository mappingRepository;
    private final MonitoringProviderRegistry providerRegistry;
    private final DeviceMetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final com.mspportal.integrationcore.service.ProviderResourceMappingService mappingService;
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    public MonitoringPollingScheduler(ProviderResourceMappingRepository mappingRepository,
                                      MonitoringProviderRegistry providerRegistry,
                                      DeviceMetricRepository metricRepository,
                                      AlertRepository alertRepository,
                                      com.mspportal.integrationcore.service.ProviderResourceMappingService mappingService,
                                      org.springframework.transaction.PlatformTransactionManager transactionManager) {
        this.mappingRepository = mappingRepository;
        this.providerRegistry = providerRegistry;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.mappingService = mappingService;
        this.transactionTemplate = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /**
     * Polls all registered monitoring providers every 5 minutes.
     * Persists NormalizedMetric and NormalizedAlert snapshots for each mapped device.
     * This accumulates historical data for time-series charts without requiring manual sync.
     */
    @Scheduled(fixedDelay = 30000, initialDelay = 60000)
    public void pollAllDeviceMetrics() {
        log.info("[SCHEDULER] Starting monitoring poll cycle");
        
        List<ProviderResourceMapping> allMappings;
        try {
            allMappings = mappingRepository.findAllDeviceMappingsNative();
        } catch (Exception e) {
            log.error("[SCHEDULER] Failed to load device mappings: {}", e.getMessage());
            return;
        }
        
        log.info("[SCHEDULER] Found {} device mappings to poll", allMappings.size());
        
        for (ProviderResourceMapping mapping : allMappings) {
            UUID mappingId = mapping.getId();
            String tenantId = mapping.getTenantId();
            String previousTenant = TenantContext.getCurrentTenant();
            try {
                TenantContext.setCurrentTenant(tenantId);
                transactionTemplate.execute(status -> {
                    pollDeviceMapping(mappingId, tenantId);
                    return null;
                });
            } catch (Exception e) {
                log.error("[SCHEDULER] Error processing mapping {}", mappingId, e);
            } finally {
                TenantContext.setCurrentTenant(previousTenant);
            }
        }
        
        log.info("[SCHEDULER] Poll cycle complete");
    }

    private void pollDeviceMapping(UUID mappingId, String tenantId) {
        ProviderResourceMapping mapping = mappingRepository.findById(mappingId).orElse(null);
        if (mapping == null || mapping.getProviderConnection() == null) return;

        UUID connectionId = mapping.getProviderConnection().getId();
        String providerName = mapping.getProviderConnection().getProviderName();
        String externalId = mapping.getExternalResourceId();
        UUID deviceId = mapping.getInternalResourceId();
        
        Optional<MonitoringProvider> providerOpt = providerRegistry.resolve(providerName);
            if (providerOpt.isEmpty()) {
                log.debug("[SCHEDULER] No provider registered for: {}", providerName);
                return;
            }
            
            MonitoringProvider provider = providerOpt.get();
            
            // Poll metrics
            try {
                List<com.mspportal.integrationcore.dto.NormalizedMetric> metrics = provider.getMetrics(connectionId, externalId);
                Double cpu = null, mem = null, disk = null, netIn = null, netOut = null, uptime = null;
                for (com.mspportal.integrationcore.dto.NormalizedMetric nm : metrics) {
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
                    metricRepository.save(metric);
                    log.info("[SCHEDULER] Saved metric: deviceId={}, cpu={}, mem={}, disk={}, netIn={}, netOut={}, uptime={}", 
                        deviceId, cpu, mem, disk, netIn, netOut, uptime);
                }
            } catch (Exception e) {
                log.error("[SCHEDULER] Metrics poll failed for device={}, provider={}: {}", deviceId, providerName, e.getMessage());
            }
            
            // Poll alerts
            try {
                List<com.mspportal.integrationcore.dto.NormalizedAlert> alerts = provider.getAlerts(connectionId, externalId);
                log.info("[SCHEDULER] Alerts poll: deviceId={}, count={}", deviceId, alerts.size());
                for (com.mspportal.integrationcore.dto.NormalizedAlert na : alerts) {
                    Optional<ProviderResourceMapping> alertMappingOpt = mappingRepository
                            .findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                                    connectionId, ProviderResourceType.ALERT, na.getExternalId());
                    if (alertMappingOpt.isPresent()) {
                        alertRepository.findById(alertMappingOpt.get().getInternalResourceId()).ifPresent(alert -> {
                            if ("RESOLVED".equalsIgnoreCase(na.getStatus()) && alert.getStatus() != AlertStatus.RESOLVED) {
                                alert.setStatus(AlertStatus.RESOLVED);
                                alert.setResolvedAt(na.getRecoveredAt() != null ? na.getRecoveredAt() : Instant.now());
                                alertRepository.save(alert);
                            }
                        });
                    } else if ("OPEN".equalsIgnoreCase(na.getStatus())) {
                        Alert alert = new Alert();
                        alert.setDeviceId(deviceId);
                        alert.setType(na.getSource());
                        AlertSeverity severity = AlertSeverity.INFO;
                        try { severity = AlertSeverity.valueOf(na.getSeverity().toUpperCase()); } catch (Exception ignored) {}
                        alert.setSeverity(severity);
                        alert.setTitle(na.getTitle());
                        alert.setMessage(na.getDescription());
                        alert.setStatus(AlertStatus.OPEN);
                        Alert saved = alertRepository.saveAndFlush(alert);
                        mappingService.upsert(connectionId, ProviderResourceType.ALERT, na.getExternalId(), "SYNCED", saved.getId());
                    }
                }
            } catch (Exception e) {
                log.error("[SCHEDULER] Alerts poll failed for device={}: {}", deviceId, e.getMessage());
            }
    }
}
