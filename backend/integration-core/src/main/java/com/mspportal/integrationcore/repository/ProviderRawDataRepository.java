package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.enums.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProviderRawDataRepository extends JpaRepository<ProviderRawData, UUID> {
    org.springframework.data.domain.Page<ProviderRawData> findByProviderConnectionId(UUID providerConnectionId, org.springframework.data.domain.Pageable pageable);
    void deleteByCollectedAtBefore(java.time.Instant timestamp);
    
    List<ProviderRawData> findByTenantIdAndProviderTypeAndResourceTypeOrderByProviderTimestampDesc(String tenantId, ProviderType providerType, String resourceType);
    
    java.util.Optional<ProviderRawData> findFirstByProviderObjectId(String providerObjectId);
    
    java.util.Optional<ProviderRawData> findFirstByTenantIdAndProviderObjectId(String tenantId, String providerObjectId);
    
    List<ProviderRawData> findByTenantIdAndSyncRunId(String tenantId, String syncRunId);

    java.util.Optional<ProviderRawData> findFirstByProviderConnectionIdAndProviderObjectIdOrderByCollectedAtDesc(
            UUID providerConnectionId, String providerObjectId);
}
