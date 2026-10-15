package com.mspportal.backup.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.backup.enums.BackupJobStatus;
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
@Table(name = "backup_jobs")
public class BackupJob extends BaseTenantEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(name = "source_type")
    private String sourceType;

    @Column(name = "source_name")
    private String sourceName;

    @Column(nullable = false)
    private String schedule;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "retention_days")
    private Integer retentionDays;

    @Column(name = "last_run_at")
    private Instant lastRunAt;

    @Column(name = "next_run_at")
    private Instant nextRunAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupJobStatus status;
}
