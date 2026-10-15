package com.mspportal.security.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.security.enums.EndpointProtectionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "security_endpoints")
public class SecurityEndpoint extends BaseTenantEntity {

    @Column(name = "device_id")
    private UUID deviceId;

    @Column(nullable = false)
    private String hostname;

    @Column(name = "ip_address")
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "protection_status", nullable = false)
    private EndpointProtectionStatus protectionStatus;

    @Column(name = "agent_version")
    private String agentVersion;

    @Column(name = "last_check_at")
    private Instant lastCheckAt;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "isolation_supported")
    private boolean isolationSupported;
}
