package com.mspportal.backup.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.backup.enums.BackupExecutionStatus;
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
@Table(name = "backup_executions")
public class BackupExecution extends BaseTenantEntity {

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupExecutionStatus status;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @Column(name = "data_transferred_bytes")
    private Long dataTransferredBytes;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
