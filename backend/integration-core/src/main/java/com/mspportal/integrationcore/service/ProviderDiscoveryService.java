package com.mspportal.integrationcore.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.dto.DiscoveredResource;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderDiscoveryService {

    private final ProviderConnectionRepository providerConnectionRepository;
    private final ApplicationContext applicationContext;

    @Transactional(readOnly = true)
    public List<DiscoveredResource> discoverResources(UUID providerConnectionId, ProviderResourceType resourceType) {
        String currentTenantId = TenantContext.getCurrentTenant();
        if (currentTenantId == null) {
            throw new AccessDeniedException("No tenant context available.");
        }

        ProviderConnection connection = providerConnectionRepository.findById(providerConnectionId)
                .orElseThrow(() -> new IllegalArgumentException("Provider connection not found"));

        if (!currentTenantId.equals(connection.getTenantId())) {
            throw new AccessDeniedException("Provider connection belongs to a different tenant");
        }

        if (!connection.isEnabled()) {
            throw new IllegalStateException("Provider connection is disabled");
        }

        // Identify capability needed
        ProviderCapability requiredCapability = switch (resourceType) {
            case SITE -> ProviderCapability.DISCOVER_SITES;
            case DEVICE -> ProviderCapability.DISCOVER_DEVICES;
            case ALERT -> ProviderCapability.DISCOVER_ALERTS;
        };

        if (!connection.getCapabilities().contains(requiredCapability)) {
            throw new UnsupportedOperationException("Provider does not support capability: " + requiredCapability);
        }

        // Get the right provider bean from the registry
        log.info("[SYNC] Initiating discovery for connectionId={}, resourceType={}", providerConnectionId, resourceType);
        com.mspportal.integrationcore.provider.MonitoringProviderRegistry registry =
                applicationContext.getBean(com.mspportal.integrationcore.provider.MonitoringProviderRegistry.class);
        
        com.mspportal.integrationcore.provider.MonitoringProvider monitoringProvider =
                registry.resolveOrThrow(connection.getProviderName());

        try {
            List<DiscoveredResource> resources = switch (resourceType) {
                case SITE -> monitoringProvider.discoverSites(providerConnectionId);
                case DEVICE -> monitoringProvider.discoverDevices(providerConnectionId);
                case ALERT -> monitoringProvider.discoverAlerts(providerConnectionId);
            };
            log.info("[SYNC] Discovery completed. connectionId={}, resourceType={}, count={}", 
                    providerConnectionId, resourceType, resources != null ? resources.size() : 0);
            return resources;
        } catch (Exception e) {
            log.error("[SYNC] Discovery failed for connectionId={}, resourceType={}: {}", 
                    providerConnectionId, resourceType, e.getMessage(), e);
            throw e;
        }
    }
}
