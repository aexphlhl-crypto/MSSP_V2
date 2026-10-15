package com.mspportal.backup.dto;

import lombok.Data;

@Data
public class BackupRepositorySummary {
    private long totalRepositories;
    private long totalCapacityBytes;
    private long usedCapacityBytes;
}
