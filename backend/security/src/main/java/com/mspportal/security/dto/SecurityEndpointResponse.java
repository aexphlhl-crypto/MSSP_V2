package com.mspportal.security.dto;

import com.mspportal.security.enums.EndpointProtectionStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SecurityEndpointResponse {
    private UUID id;
    private String tenantId;
    private UUID deviceId;
    private String hostname;
    private String ipAddress;
    private EndpointProtectionStatus protectionStatus;
    private String agentVersion;
    private Instant lastCheckAt;
    private Integer riskScore;
    private boolean isolationSupported;
}
