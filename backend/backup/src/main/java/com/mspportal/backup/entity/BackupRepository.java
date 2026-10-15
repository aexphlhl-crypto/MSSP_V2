package com.mspportal.backup.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.backup.enums.BackupRepositoryStatus;
import com.mspportal.backup.enums.BackupRepositoryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "backup_repositories")
public class BackupRepository extends BaseTenantEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupRepositoryType type;

    @Column
    private String endpoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupRepositoryStatus status;

    @Column(name = "capacity_bytes")
    private Long capacityBytes;

    @Column(name = "used_bytes")
    private Long usedBytes;

    @Column(name = "last_check_at")
    private Instant lastCheckAt;
}
