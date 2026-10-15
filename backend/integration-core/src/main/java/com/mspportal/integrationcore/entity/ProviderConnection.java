package com.mspportal.integrationcore.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.enums.ProviderType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "provider_connections")
@Getter
@Setter
public class ProviderConnection extends BaseTenantEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private ProviderType providerType;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "base_url")
    private String baseUrl;

    @Column(name = "authentication_type")
    private String authenticationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProviderStatus status = ProviderStatus.NOT_CONFIGURED;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "last_sync_at")
    private Instant lastSyncAt;

    @Column(name = "last_successful_sync_at")
    private Instant lastSuccessfulSyncAt;

    @Column(name = "last_error")
    private String lastError;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_capabilities", joinColumns = @JoinColumn(name = "provider_connection_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "capability")
    private java.util.Set<com.mspportal.integrationcore.enums.ProviderCapability> capabilities = new java.util.HashSet<>();
}
