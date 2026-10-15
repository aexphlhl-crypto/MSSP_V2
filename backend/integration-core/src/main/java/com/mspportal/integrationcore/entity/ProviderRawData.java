package com.mspportal.integrationcore.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.integrationcore.enums.ProviderType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "provider_raw_data")
@Getter
@Setter
public class ProviderRawData extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_connection_id", nullable = false)
    private ProviderConnection providerConnection;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private ProviderType providerType;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "provider_object_id", nullable = false)
    private String providerObjectId;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt;

    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    @Column(name = "payload_hash")
    private String payloadHash;

    @Column(name = "schema_version")
    private String schemaVersion;

    @Column(name = "endpoint")
    private String endpoint;

    @Column(name = "sync_run_id")
    private String syncRunId;

    @Column(name = "ingestion_status")
    private String ingestionStatus;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "provider_timestamp")
    private Instant providerTimestamp;

    @Column(name = "data_freshness")
    private String dataFreshness;

    @Column(name = "sync_status")
    private String syncStatus;
}
