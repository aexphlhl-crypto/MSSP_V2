package com.mspportal.application.correlation;

import com.mspportal.application.domain.OperationalIncident;
import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.security.dto.SecurityEventResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class IncidentCorrelationService {

    public OperationalIncident correlate(SecurityEventResponse event) {
        OperationalIncident incident = new OperationalIncident();
        incident.setIncidentId(UUID.randomUUID());
        incident.setTenantId(event.getTenantId());
        incident.setProviderName(event.getSource() != null ? event.getSource() : "SECURITY_PROVIDER");
        incident.setProviderObjectId(event.getEndpointId() != null ? event.getEndpointId().toString() : "UNKNOWN");
        incident.setStatus("NEW");
        incident.setCreatedAt(LocalDateTime.now());
        incident.getSourceEventIds().add(event.getId().toString());
        return incident;
    }

    public OperationalIncident correlate(AlertResponse alert) {
        OperationalIncident incident = new OperationalIncident();
        incident.setIncidentId(UUID.randomUUID());
        incident.setTenantId(alert.getTenantId());
        incident.setProviderName("MONITORING_PROVIDER");
        incident.setProviderObjectId(alert.getDeviceId() != null ? alert.getDeviceId().toString() : "UNKNOWN");
        incident.setStatus("NEW");
        incident.setCreatedAt(LocalDateTime.now());
        incident.getSourceEventIds().add(alert.getId().toString());
        return incident;
    }

    public OperationalIncident correlate(BackupAlertResponse alert) {
        OperationalIncident incident = new OperationalIncident();
        incident.setIncidentId(UUID.randomUUID());
        incident.setTenantId(alert.getTenantId());
        incident.setProviderName("BACKUP_PROVIDER");
        incident.setProviderObjectId(alert.getJobId() != null ? alert.getJobId().toString() : "UNKNOWN");
        incident.setStatus("NEW");
        incident.setCreatedAt(LocalDateTime.now());
        incident.getSourceEventIds().add(alert.getId().toString());
        return incident;
    }

    public OperationalIncident correlateAdvanced(java.util.List<String> sourceEventIds, java.util.List<String> ips, java.util.List<String> providerObjectIds, Integer timeWindowMinutes, String tenantId) {
        OperationalIncident incident = new OperationalIncident();
        String traceId = UUID.randomUUID().toString();
        incident.setIncidentId(UUID.randomUUID());
        incident.setTenantId(tenantId);
        incident.setProviderName("CORRELATION_ENGINE");
        incident.setProviderObjectId(String.join(",", providerObjectIds));
        incident.setStatus("NEW");
        incident.setCreatedAt(LocalDateTime.now());
        incident.getSourceEventIds().addAll(sourceEventIds);
        incident.setCorrelationExplanation(String.format(
            "Trace ID: %s | Correlated on IPs: %s within %d minutes | Source Events: %s | Matched Objects: %s",
            traceId, String.join(",", ips), timeWindowMinutes, String.join(",", sourceEventIds), String.join(",", providerObjectIds)
        ));
        return incident;
    }
}
