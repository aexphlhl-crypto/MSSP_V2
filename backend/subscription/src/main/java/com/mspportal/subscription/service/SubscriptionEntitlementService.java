package com.mspportal.subscription.service;

import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.SubscriptionStatus;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.subscription.entity.PlanProviderEntitlement;

@Service
public class SubscriptionEntitlementService {

    private final TenantSubscriptionRepository repository;

    public SubscriptionEntitlementService(TenantSubscriptionRepository repository) {
        this.repository = repository;
    }

    public boolean hasEntitlement(String tenantId, String requiredFeature) {
        Optional<TenantSubscription> subOpt = repository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
        if (subOpt.isEmpty()) return false;
        TenantSubscription sub = subOpt.get();
        if (sub.getEndAt() != null && sub.getEndAt().isBefore(Instant.now())) return false;
        
        return sub.getPlan().getFeatures().stream()
                .anyMatch(f -> f.name().equals(requiredFeature));
    }

    public boolean isProviderAllowed(String tenantId, String providerName) {
        Optional<TenantSubscription> subOpt = repository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
        if (subOpt.isEmpty()) return false;
        TenantSubscription sub = subOpt.get();
        if (sub.getEndAt() != null && sub.getEndAt().isBefore(Instant.now())) return false;

        return sub.getPlan().getProviderEntitlements().stream()
                .anyMatch(pe -> pe.getProviderName().equalsIgnoreCase(providerName));
    }

    public com.mspportal.integrationcore.enums.AuthorizationReason checkProviderCapabilityEntitlement(String tenantId, String providerName, ProviderCapability capability) {
        Optional<TenantSubscription> subOpt = repository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
        if (subOpt.isEmpty()) return com.mspportal.integrationcore.enums.AuthorizationReason.NO_ACTIVE_SUBSCRIPTION;
        
        TenantSubscription sub = subOpt.get();
        if (sub.getEndAt() != null && sub.getEndAt().isBefore(Instant.now())) {
            return com.mspportal.integrationcore.enums.AuthorizationReason.NO_ACTIVE_SUBSCRIPTION;
        }

        boolean providerEntitled = sub.getPlan().getProviderEntitlements().stream()
                .anyMatch(pe -> pe.getProviderName().equalsIgnoreCase(providerName));
                
        if (!providerEntitled) {
            return com.mspportal.integrationcore.enums.AuthorizationReason.PROVIDER_NOT_ENTITLED;
        }
        
        boolean capabilityEntitled = sub.getPlan().getProviderEntitlements().stream()
                .filter(pe -> pe.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .map(pe -> pe.getCapabilities().contains(capability))
                .orElse(false);
                
        if (!capabilityEntitled) {
            return com.mspportal.integrationcore.enums.AuthorizationReason.CAPABILITY_NOT_ENTITLED;
        }
        
        return com.mspportal.integrationcore.enums.AuthorizationReason.ALLOW;
    }
}
