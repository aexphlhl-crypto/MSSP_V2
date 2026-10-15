package com.mspportal.backup.dto;

import com.mspportal.backup.enums.BackupRepositoryStatus;
import com.mspportal.backup.enums.BackupRepositoryType;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class BackupRepositoryResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private BackupRepositoryType type;
    private String endpoint;
    private BackupRepositoryStatus status;
    private Long capacityBytes;
    private Long usedBytes;
    private Instant lastCheckAt;
}
