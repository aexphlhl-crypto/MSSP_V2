package com.mspportal.security.dto;

import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventStatus;
import com.mspportal.security.enums.SecurityEventType;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SecurityEventResponse {
    private UUID id;
    private String tenantId;
    private UUID endpointId;
    private String endpointHostname;
    private String endpointIpAddress;
    private SecurityEventType type;
    private SecurityEventSeverity severity;
    private SecurityEventStatus status;
    private String title;
    private String description;
    private String source;
    private Instant detectedAt;
    private Instant resolvedAt;
    private Instant createdAt;
}
