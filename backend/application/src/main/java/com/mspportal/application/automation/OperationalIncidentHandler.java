package com.mspportal.application.automation;

import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.security.dto.SecurityEventResponse;

public interface OperationalIncidentHandler {
    void handleMonitoringAlert(AlertResponse alert, String tenantId);
    void handleSecurityEvent(SecurityEventResponse event, String tenantId);
    void handleBackupAlert(BackupAlertResponse alert, String tenantId);
}
