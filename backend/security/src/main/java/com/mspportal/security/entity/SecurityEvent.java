package com.mspportal.security.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventStatus;
import com.mspportal.security.enums.SecurityEventType;
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
@Table(name = "security_events")
public class SecurityEvent extends BaseTenantEntity {

    @Column(name = "endpoint_id")
    private UUID endpointId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SecurityEventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SecurityEventSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SecurityEventStatus status;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String source;

    @Column(name = "detected_at")
    private Instant detectedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
