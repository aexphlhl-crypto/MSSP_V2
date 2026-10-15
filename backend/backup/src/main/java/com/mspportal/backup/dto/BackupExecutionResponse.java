package com.mspportal.backup.dto;

import com.mspportal.backup.enums.BackupExecutionStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class BackupExecutionResponse {
    private UUID id;
    private String tenantId;
    private UUID jobId;
    private Instant startedAt;
    private Instant finishedAt;
    private BackupExecutionStatus status;
    private Long durationSeconds;
    private Long dataTransferredBytes;
    private String errorMessage;
}
