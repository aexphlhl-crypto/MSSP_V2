package com.mspportal.integrationcore.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "provider_sync_runs")
@Getter
@Setter
public class ProviderSyncRun extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_connection_id", nullable = false)
    private ProviderConnection providerConnection;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "objects_fetched")
    private Integer objectsFetched;

    @Column(name = "objects_created")
    private Integer objectsCreated;

    @Column(name = "objects_updated")
    private Integer objectsUpdated;

    @Column(name = "objects_failed")
    private Integer objectsFailed;

    @Column(name = "error_message")
    private String errorMessage;
}
