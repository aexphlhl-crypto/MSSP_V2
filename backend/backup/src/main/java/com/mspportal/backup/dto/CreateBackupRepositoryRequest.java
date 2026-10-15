package com.mspportal.backup.dto;

import com.mspportal.backup.enums.BackupRepositoryType;
import lombok.Data;

@Data
public class CreateBackupRepositoryRequest {
    private String name;
    private BackupRepositoryType type;
    private String endpoint;
    private Long capacityBytes;
}
