package com.mspportal.backup.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UpdateBackupJobRequest {
    private String name;
    private UUID repositoryId;
    private String sourceType;
    private String sourceName;
    private String schedule;
    private Boolean enabled;
    private Integer retentionDays;
}
