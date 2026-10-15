package com.mspportal.backup.dto;

import lombok.Data;

@Data
public class BackupSummaryResponse {
    private long totalRepositories;
    private long onlineRepositories;
    private long totalJobs;
    private long successfulJobs;
    private long failedJobs;
    private long runningJobs;
    private long warningJobs; // Added this one as it usually exists with successful/failed
    private long criticalAlerts;
    private long openAlerts; // Helpful
    private long storageCapacity;
    private long storageUsed;
}
