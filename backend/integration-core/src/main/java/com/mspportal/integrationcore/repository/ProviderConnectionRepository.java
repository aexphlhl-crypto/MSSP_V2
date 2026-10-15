package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mspportal.integrationcore.enums.ProviderStatus;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ProviderConnectionRepository extends JpaRepository<ProviderConnection, UUID> {
    List<ProviderConnection> findByStatus(ProviderStatus status);
    Optional<ProviderConnection> findByIdAndTenantId(UUID id, String tenantId);

    /**
     * Fetches a ProviderConnection by ID WITHOUT Hibernate @TenantId filter.
     * Used by ZabbixClient and other provider clients that authenticate across tenant contexts.
     * The caller is responsible for verifying authorization; this bypasses @TenantId only.
     */
    @Query(value = "SELECT * FROM provider_connections WHERE id = :id LIMIT 1", nativeQuery = true)
    Optional<ProviderConnection> findByIdNative(@Param("id") UUID id);
}
