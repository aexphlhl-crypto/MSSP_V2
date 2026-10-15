package com.mspportal.monitoring.service;

import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.monitoring.entity.Alert;
import com.mspportal.monitoring.enums.AlertStatus;
import com.mspportal.monitoring.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final com.mspportal.monitoring.repository.DeviceRepository deviceRepository;
    private final MonitoringServiceHelper helper;

    public AlertService(AlertRepository alertRepository, com.mspportal.monitoring.repository.DeviceRepository deviceRepository, MonitoringServiceHelper helper) {
        this.alertRepository = alertRepository;
        this.deviceRepository = deviceRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> listAlerts(String requestedTenantId, UUID siteId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            List<Alert> alerts;
            if (siteId != null) {
                List<UUID> deviceIds = deviceRepository.findIdsBySiteId(siteId);
                if (deviceIds.isEmpty()) {
                    return java.util.Collections.emptyList();
                }
                alerts = alertRepository.findByDeviceIdIn(deviceIds);
            } else {
                alerts = alertRepository.findAll();
            }
            return alerts.stream().map(this::mapToResponse).collect(Collectors.toList());
        });
    }

    @Transactional(readOnly = true)
    public AlertResponse getAlert(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Alert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            return mapToResponse(alert);
        });
    }

    @Transactional
    public AlertResponse acknowledgeAlert(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot acknowledge alerts");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Alert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            
            if (alert.getStatus() == AlertStatus.OPEN) {
                alert.setStatus(AlertStatus.ACKNOWLEDGED);
                alert.setAcknowledgedAt(Instant.now());
                alert.setAcknowledgedBy(helper.getCurrentUserId());
                alert = alertRepository.save(alert);
            }
            return mapToResponse(alert);
        });
    }

    @Transactional
    public AlertResponse resolveAlert(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot resolve alerts");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Alert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            
            if (alert.getStatus() == AlertStatus.OPEN || alert.getStatus() == AlertStatus.ACKNOWLEDGED) {
                alert.setStatus(AlertStatus.RESOLVED);
                alert.setResolvedAt(Instant.now());
                alert = alertRepository.save(alert);
            }
            return mapToResponse(alert);
        });
    }

    private AlertResponse mapToResponse(Alert a) {
        AlertResponse r = new AlertResponse();
        r.setId(a.getId());
        r.setTenantId(a.getTenantId());
        r.setDeviceId(a.getDeviceId());
        r.setType(a.getType());
        r.setSeverity(a.getSeverity());
        r.setTitle(a.getTitle());
        r.setMessage(a.getMessage());
        r.setStatus(a.getStatus());
        r.setAcknowledgedAt(a.getAcknowledgedAt());
        r.setResolvedAt(a.getResolvedAt());
        r.setAcknowledgedBy(a.getAcknowledgedBy());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
