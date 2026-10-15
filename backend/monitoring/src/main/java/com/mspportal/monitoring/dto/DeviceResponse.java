package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.DeviceStatus;
import com.mspportal.monitoring.enums.DeviceType;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DeviceResponse {
    private UUID id;
    private String tenantId;
    private UUID siteId;
    private String hostname;
    private String displayName;
    private String ipAddress;
    private DeviceType deviceType;
    private String operatingSystem;
    private DeviceStatus status;
    private boolean monitoringEnabled;
    private Instant lastSeenAt;
    private Instant createdAt;
    private Instant updatedAt;
    
    // UI Contextual Fields
    private String siteName;
    private long alertCount;
    private long criticalAlertCount;
    private long warningAlertCount;
    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    
    private java.util.List<ProviderMappingSummary> providerMappings;
}
