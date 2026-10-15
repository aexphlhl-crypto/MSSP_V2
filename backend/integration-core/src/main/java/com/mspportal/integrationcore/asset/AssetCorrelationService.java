package com.mspportal.integrationcore.asset;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetCorrelationService {

    private final UnifiedAssetRepository assetRepository;
    private final UnifiedAssetProviderLinkRepository linkRepository;

    @Transactional
    public UnifiedAsset correlateAsset(UUID tenantId, String providerId, String providerAssetId,
                                       String hostname, String ipAddress, String macAddress,
                                       String osName, String osVersion, String assetType) {

        // First check if a link already exists
        Optional<UnifiedAssetProviderLink> existingLink = linkRepository.findByTenantIdAndProviderIdAndProviderAssetId(
                tenantId, providerId, providerAssetId);

        if (existingLink.isPresent()) {
            return assetRepository.findById(existingLink.get().getUnifiedAssetId())
                    .orElseThrow(() -> new IllegalStateException("Link exists but asset does not"));
        }

        // Try to correlate by MAC, then IP, then Hostname
        UnifiedAsset asset = null;
        if (macAddress != null) {
            asset = assetRepository.findByTenantIdAndMacAddress(tenantId, macAddress).orElse(null);
        }
        if (asset == null && ipAddress != null) {
            asset = assetRepository.findByTenantIdAndIpAddress(tenantId, ipAddress).orElse(null);
        }
        if (asset == null && hostname != null) {
            asset = assetRepository.findByTenantIdAndHostname(tenantId, hostname).orElse(null);
        }

        if (asset == null) {
            // Create new asset
            asset = UnifiedAsset.builder()
                    .tenantId(tenantId)
                    .hostname(hostname)
                    .ipAddress(ipAddress)
                    .macAddress(macAddress)
                    .osName(osName)
                    .osVersion(osVersion)
                    .assetType(assetType)
                    .status("ACTIVE")
                    .build();
            asset = assetRepository.save(asset);
        }

        // Create the link
        UnifiedAssetProviderLink newLink = UnifiedAssetProviderLink.builder()
                .tenantId(tenantId)
                .unifiedAssetId(asset.getId())
                .providerId(providerId)
                .providerAssetId(providerAssetId)
                .build();
        linkRepository.save(newLink);

        return asset;
    }
}
