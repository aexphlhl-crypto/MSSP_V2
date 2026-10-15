package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.dto.ProviderDataResponse;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.subscription.service.SubscriptionEntitlementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProviderDataService {

    private final DeviceRepository deviceRepository;
    private final ProviderResourceMappingRepository mappingRepository;
    private final MonitoringProviderRegistry providerRegistry;
    private final SubscriptionEntitlementService entitlementService;
    private final MonitoringServiceHelper helper;

    public ProviderDataService(DeviceRepository deviceRepository,
                               ProviderResourceMappingRepository mappingRepository,
                               MonitoringProviderRegistry providerRegistry,
                               SubscriptionEntitlementService entitlementService,
                               MonitoringServiceHelper helper) {
        this.deviceRepository = deviceRepository;
        this.mappingRepository = mappingRepository;
        this.providerRegistry = providerRegistry;
        this.entitlementService = entitlementService;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public ProviderDataResponse getProviderData(UUID deviceId, ProviderCapability capability, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            String tenantId = TenantContext.getCurrentTenant();
            
            // 1. Tenant owns Device (implicit via DeviceRepository and TenantContext)
            deviceRepository.findById(deviceId)
                    .orElseThrow(() -> {
                        logAuditDenial(tenantId, deviceId, "UNKNOWN", capability, com.mspportal.integrationcore.enums.AuthorizationReason.DEVICE_NOT_OWNED);
                        return new com.mspportal.integrationcore.exception.ProviderAuthorizationException(com.mspportal.integrationcore.enums.AuthorizationReason.DEVICE_NOT_OWNED, "Device not found or not accessible");
                    });

            // 2. Fetch mappings (ProviderConnection inherently belongs to Tenant due to mapping constraints)
            List<ProviderResourceMapping> mappings = mappingRepository
                    .findByInternalResourceIdAndResourceTypeNative(deviceId, ProviderResourceType.DEVICE.name());
            
            if (mappings.isEmpty()) {
                logAuditDenial(tenantId, deviceId, "UNKNOWN", capability, com.mspportal.integrationcore.enums.AuthorizationReason.PROVIDER_MAPPING_NOT_FOUND);
                throw new com.mspportal.integrationcore.exception.ProviderAuthorizationException(com.mspportal.integrationcore.enums.AuthorizationReason.PROVIDER_MAPPING_NOT_FOUND, "No provider mapping found for this device");
            }

            ProviderResourceMapping mapping = mappings.get(0);
            
            // 3. Resolve ProviderName
            String providerName = mapping.getProviderConnection().getProviderName().toUpperCase();

            // 4, 5, 6. Verify Active Subscription & Entitlements
            com.mspportal.integrationcore.enums.AuthorizationReason entitlementReason = entitlementService.checkProviderCapabilityEntitlement(tenantId, providerName, capability);
            if (entitlementReason != com.mspportal.integrationcore.enums.AuthorizationReason.ALLOW) {
                logAuditDenial(tenantId, deviceId, providerName, capability, entitlementReason);
                throw new com.mspportal.integrationcore.exception.ProviderAuthorizationException(entitlementReason, "Access denied: " + entitlementReason);
            }

            // 7. Resolve Provider
            MonitoringProvider provider = providerRegistry.resolve(providerName)
                    .orElseThrow(() -> new RuntimeException("Provider adapter not found for " + providerName));
            
            // 8. Provider supports Capability
            if (!provider.supportedCapabilities().contains(capability)) {
                logAuditDenial(tenantId, deviceId, providerName, capability, com.mspportal.integrationcore.enums.AuthorizationReason.PROVIDER_CAPABILITY_NOT_SUPPORTED);
                throw new com.mspportal.integrationcore.exception.ProviderAuthorizationException(com.mspportal.integrationcore.enums.AuthorizationReason.PROVIDER_CAPABILITY_NOT_SUPPORTED, "Provider " + providerName + " does not support capability " + capability);
            }

            // 9 & 10. Fetch and sanitize native provider data
            return provider.getNativeProviderData(mapping.getProviderConnection().getId(), mapping.getExternalResourceId(), capability);
        });
    }

    private void logAuditDenial(String tenantId, UUID deviceId, String provider, ProviderCapability capability, com.mspportal.integrationcore.enums.AuthorizationReason reason) {
        org.slf4j.LoggerFactory.getLogger(ProviderDataService.class).warn(
                "PROVIDER_ACCESS_DENIED tenantId={} deviceId={} provider={} capability={} reason={}",
                tenantId, deviceId, provider, capability, reason
        );
    }
}
