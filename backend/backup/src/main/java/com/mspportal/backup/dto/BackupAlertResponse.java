package com.mspportal.backup.dto;

import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class BackupAlertResponse {
    private UUID id;
    private String tenantId;
    private UUID jobId;
    private BackupAlertSeverity severity;
    private BackupAlertStatus status;
    private String title;
    private String message;
    private Instant createdAt;
    private Instant resolvedAt;
}
