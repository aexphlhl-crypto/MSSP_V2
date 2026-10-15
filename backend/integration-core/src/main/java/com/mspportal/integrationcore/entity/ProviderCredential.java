package com.mspportal.integrationcore.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "provider_credentials")
@Getter
@Setter
public class ProviderCredential extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_connection_id", nullable = false)
    private ProviderConnection providerConnection;

    @Column(name = "credential_type", nullable = false)
    private String credentialType;

    @Column(name = "secret_value", nullable = false)
    private String secretValue;
}
