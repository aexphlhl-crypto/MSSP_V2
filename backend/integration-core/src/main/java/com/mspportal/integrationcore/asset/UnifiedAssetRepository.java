package com.mspportal.integrationcore.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnifiedAssetRepository extends JpaRepository<UnifiedAsset, UUID> {
    List<UnifiedAsset> findByTenantId(UUID tenantId);
    Optional<UnifiedAsset> findByTenantIdAndIpAddress(UUID tenantId, String ipAddress);
    Optional<UnifiedAsset> findByTenantIdAndHostname(UUID tenantId, String hostname);
    Optional<UnifiedAsset> findByTenantIdAndMacAddress(UUID tenantId, String macAddress);
}
