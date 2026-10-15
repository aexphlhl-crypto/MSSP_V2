package com.mspportal.monitoring.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DeviceMetricResponse {
    private UUID id;
    private String tenantId;
    private UUID deviceId;
    private Instant collectedAt;
    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    private Long networkIn;
    private Long networkOut;
    private Long uptimeSeconds;
}
