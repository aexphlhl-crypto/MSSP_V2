package com.mspportal.monitoring.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "device_metrics")
public class DeviceMetric extends BaseTenantEntity {

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "memory_usage")
    private Double memoryUsage;

    @Column(name = "disk_usage")
    private Double diskUsage;

    @Column(name = "network_in")
    private Long networkIn;

    @Column(name = "network_out")
    private Long networkOut;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds;
}
