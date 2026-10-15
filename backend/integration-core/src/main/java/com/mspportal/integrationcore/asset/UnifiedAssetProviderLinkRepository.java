package com.mspportal.integrationcore.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnifiedAssetProviderLinkRepository extends JpaRepository<UnifiedAssetProviderLink, UUID> {
    Optional<UnifiedAssetProviderLink> findByTenantIdAndProviderIdAndProviderAssetId(UUID tenantId, String providerId, String providerAssetId);
}
