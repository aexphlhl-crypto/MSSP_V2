package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.monitoring.dto.MonitoringSummaryResponse;
import com.mspportal.monitoring.enums.AlertStatus;
import com.mspportal.monitoring.enums.AlertSeverity;
import com.mspportal.monitoring.enums.DeviceStatus;
import com.mspportal.monitoring.repository.AlertRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.monitoring.repository.SiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MonitoringSummaryService {

    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final MonitoringServiceHelper helper;

    public MonitoringSummaryService(SiteRepository siteRepository, DeviceRepository deviceRepository, AlertRepository alertRepository, MonitoringServiceHelper helper) {
        this.siteRepository = siteRepository;
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public MonitoringSummaryResponse getSummary(String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            // Note: with TenantContext, these queries are automatically isolated by the current tenant (via @TenantId).
            long totalSites = siteRepository.count();
            long totalDevices = deviceRepository.count();
            
            // In a real application we would use custom JPA queries or specifications to count by enum.
            // Since phase 5 is focused on basic structure, we can count in memory or write repository methods.
            // We have repository methods for findByStatus but count is better. For now we will fetch all devices and count in memory since dataset is small in mock phase.
            
            // Note: Since we are not allowed to modify existing common repo or generate test, we will just use basic findAll and filter.
            long onlineDevices = deviceRepository.findAll().stream().filter(d -> d.getStatus() == DeviceStatus.ONLINE).count();
            long offlineDevices = deviceRepository.findAll().stream().filter(d -> d.getStatus() == DeviceStatus.OFFLINE).count();
            long warningDevices = deviceRepository.findAll().stream().filter(d -> d.getStatus() == DeviceStatus.WARNING).count();
            long criticalDevices = deviceRepository.findAll().stream().filter(d -> d.getStatus() == DeviceStatus.CRITICAL).count();

            long openAlerts = alertRepository.findAll().stream().filter(a -> a.getStatus() == AlertStatus.OPEN).count();
            long criticalAlerts = alertRepository.findAll().stream().filter(a -> a.getStatus() == AlertStatus.OPEN && a.getSeverity() == AlertSeverity.CRITICAL).count();

            MonitoringSummaryResponse res = new MonitoringSummaryResponse();
            res.setTotalSites(totalSites);
            res.setTotalDevices(totalDevices);
            res.setOnlineDevices(onlineDevices);
            res.setOfflineDevices(offlineDevices);
            res.setWarningDevices(warningDevices);
            res.setCriticalDevices(criticalDevices);
            res.setOpenAlerts(openAlerts);
            res.setCriticalAlerts(criticalAlerts);
            
            return res;
        });
    }
}
