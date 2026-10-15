package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderResourceMappingRepository extends JpaRepository<ProviderResourceMapping, UUID> {

    Optional<ProviderResourceMapping> findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
            UUID providerConnectionId, ProviderResourceType resourceType, String externalResourceId);

    List<ProviderResourceMapping> findByInternalResourceIdAndResourceType(UUID internalResourceId, ProviderResourceType resourceType);

    List<ProviderResourceMapping> findByTenantIdAndResourceTypeAndInternalResourceId(
            String tenantId, ProviderResourceType resourceType, UUID internalResourceId);

    boolean existsByProviderConnectionIdAndResourceTypeAndExternalResourceId(
            UUID providerConnectionId, ProviderResourceType resourceType, String externalResourceId);

    List<ProviderResourceMapping> findByProviderConnectionId(UUID providerConnectionId);

    List<ProviderResourceMapping> findByProviderConnectionIdAndResourceType(UUID providerConnectionId, ProviderResourceType resourceType);

    /**
     * Native query variant that bypasses the Hibernate @TenantId filter.
     * Required for internal service calls (MetricService, MonitoringPollingScheduler) where
     * TenantContext may not be set, causing the JPA-derived query to return empty results.
     */
    @Query(value = "SELECT * FROM provider_resource_mappings WHERE internal_resource_id = :deviceId AND resource_type = :resourceType",
           nativeQuery = true)
    List<ProviderResourceMapping> findByInternalResourceIdAndResourceTypeNative(
            @Param("deviceId") UUID deviceId,
            @Param("resourceType") String resourceType);

    /**
     * Native query: find all DEVICE mappings across all tenants (for background scheduler).
     */
    @Query(value = "SELECT * FROM provider_resource_mappings WHERE resource_type = 'DEVICE'", nativeQuery = true)
    List<ProviderResourceMapping> findAllDeviceMappingsNative();
}
