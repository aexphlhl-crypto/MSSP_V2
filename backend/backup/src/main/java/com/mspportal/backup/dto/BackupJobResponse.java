package com.mspportal.backup.dto;

import com.mspportal.backup.enums.BackupJobStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class BackupJobResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private UUID repositoryId;
    private String sourceType;
    private String sourceName;
    private String schedule;
    private boolean enabled;
    private Integer retentionDays;
    private Instant lastRunAt;
    private Instant nextRunAt;
    private BackupJobStatus status;
}
