package com.mspportal.integrationcore.asset;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "unified_asset_provider_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnifiedAssetProviderLink {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "unified_asset_id", nullable = false)
    private UUID unifiedAssetId;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "provider_asset_id", nullable = false)
    private String providerAssetId;

    @Column(name = "provider_asset_type")
    private String providerAssetType;

    @Column(name = "last_synced_at")
    private OffsetDateTime lastSyncedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
