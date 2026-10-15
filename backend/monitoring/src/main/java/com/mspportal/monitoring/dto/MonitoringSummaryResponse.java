package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class MonitoringSummaryResponse {
    private long totalSites;
    private long totalDevices;
    private long onlineDevices;
    private long offlineDevices;
    private long warningDevices;
    private long criticalDevices;
    private long openAlerts;
    private long criticalAlerts;
}
