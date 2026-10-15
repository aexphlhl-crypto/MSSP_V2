package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.AlertSeverity;
import com.mspportal.monitoring.enums.AlertStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class AlertResponse {
    private UUID id;
    private String tenantId;
    private UUID deviceId;
    private String type;
    private AlertSeverity severity;
    private String title;
    private String message;
    private AlertStatus status;
    private Instant acknowledgedAt;
    private Instant resolvedAt;
    private String acknowledgedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
