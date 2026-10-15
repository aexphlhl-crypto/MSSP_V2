package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderCredentialRepository extends JpaRepository<ProviderCredential, UUID> {
    Optional<ProviderCredential> findByProviderConnectionId(UUID providerConnectionId);
    void deleteByProviderConnectionId(UUID providerConnectionId);

    /**
     * Fetches a credential by provider_connection_id WITHOUT Hibernate @TenantId filter.
     * Required when ZabbixClient or other provider clients authenticate inside a service call,
     * because their thread may hold a different tenant context than the credential's tenant_id.
     * Security: ProviderConnection itself is tenant-scoped, so this lookup is safe.
     */
    @Query(value = "SELECT * FROM provider_credentials WHERE provider_connection_id = :connectionId LIMIT 1", nativeQuery = true)
    Optional<ProviderCredential> findByProviderConnectionIdNative(@Param("connectionId") UUID connectionId);
}
