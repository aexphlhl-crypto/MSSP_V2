package com.mspportal.backup.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
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
@Table(name = "backup_alerts")
public class BackupAlert extends BaseTenantEntity {

    @Column(name = "job_id")
    private UUID jobId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupAlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupAlertStatus status;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
