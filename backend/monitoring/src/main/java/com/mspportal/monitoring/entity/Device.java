package com.mspportal.monitoring.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.monitoring.enums.DeviceStatus;
import com.mspportal.monitoring.enums.DeviceType;
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
@Table(name = "devices")
public class Device extends BaseTenantEntity {

    @Column(name = "site_id")
    private UUID siteId;

    @Column(nullable = false)
    private String hostname;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "ip_address")
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false)
    private DeviceType deviceType;

    @Column(name = "operating_system")
    private String operatingSystem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status;

    @Column(name = "monitoring_enabled")
    private boolean monitoringEnabled = true;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;
}
