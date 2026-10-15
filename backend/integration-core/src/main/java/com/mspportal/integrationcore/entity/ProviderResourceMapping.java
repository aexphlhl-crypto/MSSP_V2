package com.mspportal.integrationcore.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.integrationcore.enums.MappingSyncStatus;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "provider_resource_mappings",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_provider_resource_mapping",
            columnNames = {"tenant_id", "provider_connection_id", "resource_type", "external_resource_id"}
        )
    }
)
@Getter
@Setter
public class ProviderResourceMapping extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_connection_id", nullable = false)
    private ProviderConnection providerConnection;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private ProviderResourceType resourceType;

    @Column(name = "external_resource_id", nullable = false)
    private String externalResourceId;

    @Column(name = "external_parent_id")
    private String externalParentId;

    @Column(name = "internal_resource_id", nullable = false)
    private UUID internalResourceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_status", nullable = false)
    private MappingSyncStatus syncStatus = MappingSyncStatus.PENDING;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;
}
