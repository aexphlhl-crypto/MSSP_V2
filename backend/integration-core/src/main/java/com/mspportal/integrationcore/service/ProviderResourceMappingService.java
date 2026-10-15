package com.mspportal.integrationcore.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderResourceMappingService {

    private final ProviderResourceMappingRepository mappingRepository;
    private final ProviderConnectionRepository providerConnectionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public ProviderResourceMapping upsert(UUID providerConnectionId, ProviderResourceType resourceType,
                                          String externalResourceId, String externalParentId, UUID internalResourceId) {
        String currentTenantId = TenantContext.getCurrentTenant();
        if (currentTenantId == null) {
            throw new AccessDeniedException("No tenant context available.");
        }

        // 1. Validate ProviderConnection exists and belongs to current tenant
        ProviderConnection connection = providerConnectionRepository.findById(providerConnectionId)
                .orElseThrow(() -> new IllegalArgumentException("ProviderConnection not found"));
        
        if (!currentTenantId.equals(connection.getTenantId())) {
            throw new AccessDeniedException("ProviderConnection belongs to a different tenant");
        }

        // 2. Validate internal resource exists and belongs to current tenant
        validateInternalResource(resourceType, internalResourceId, currentTenantId);

        // 3. Upsert
        Optional<ProviderResourceMapping> existingOpt = mappingRepository
                .findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                        providerConnectionId, resourceType, externalResourceId);

        ProviderResourceMapping mapping;
        if (existingOpt.isPresent()) {
            mapping = existingOpt.get();
            // Ensure tenant matches
            if (!currentTenantId.equals(mapping.getTenantId())) {
                throw new AccessDeniedException("Existing mapping belongs to a different tenant");
            }
            mapping.setInternalResourceId(internalResourceId);
            mapping.setExternalParentId(externalParentId);
            mapping.setSyncStatus(com.mspportal.integrationcore.enums.MappingSyncStatus.SYNCED);
            mapping.setLastSyncedAt(Instant.now());
        } else {
            mapping = new ProviderResourceMapping();
            mapping.setProviderConnection(connection);
            mapping.setTenantId(currentTenantId);
            mapping.setResourceType(resourceType);
            mapping.setExternalResourceId(externalResourceId);
            mapping.setExternalParentId(externalParentId);
            mapping.setInternalResourceId(internalResourceId);
            mapping.setSyncStatus(com.mspportal.integrationcore.enums.MappingSyncStatus.SYNCED);
            mapping.setLastSyncedAt(Instant.now());
        }

        return mappingRepository.save(mapping);
    }

    private void validateInternalResource(ProviderResourceType resourceType, UUID internalResourceId, String tenantId) {
        String tableName = switch (resourceType) {
            case SITE -> "sites";
            case DEVICE -> "devices";
            case ALERT -> "alerts";
        };

        String query = "SELECT COUNT(id) FROM " + tableName + " WHERE id = ? AND tenant_id = ?";
        Integer count = jdbcTemplate.queryForObject(query, Integer.class, internalResourceId, tenantId);

        if (count == null || count == 0) {
            throw new AccessDeniedException("Internal resource " + internalResourceId + " of type " + resourceType + 
                    " does not exist or does not belong to tenant " + tenantId);
        }
    }

    @Transactional(readOnly = true)
    public List<ProviderResourceMapping> getMappingsForResource(ProviderResourceType resourceType, UUID internalResourceId) {
        String currentTenantId = TenantContext.getCurrentTenant();
        if (currentTenantId == null) {
            throw new AccessDeniedException("No tenant context available.");
        }
        
        // Find mappings that belong to the current tenant for the resource
        return mappingRepository.findByTenantIdAndResourceTypeAndInternalResourceId(
                currentTenantId, resourceType, internalResourceId);
    }
}
