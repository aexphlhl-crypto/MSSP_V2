package com.mspportal.backup.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateBackupJobRequest {
    private String name;
    private UUID repositoryId;
    private String sourceType;
    private String sourceName;
    private String schedule;
    private boolean enabled;
    private Integer retentionDays;
}
