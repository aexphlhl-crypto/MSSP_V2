package com.mspportal.subscription.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.FeatureKey;
import com.mspportal.subscription.enums.SubscriptionStatus;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

@Service
public class SubscriptionService {

    private final TenantSubscriptionRepository tenantSubscriptionRepository;

    public SubscriptionService(TenantSubscriptionRepository tenantSubscriptionRepository) {
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
    }

    @Transactional(readOnly = true)
    public Set<FeatureKey> getCurrentTenantFeatures() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Collections.emptySet();
        }
        
        Optional<TenantSubscription> activeSub = tenantSubscriptionRepository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
        
        return activeSub.map(sub -> sub.getPlan().getFeatures()).orElse(Collections.emptySet());
    }

    @Transactional(readOnly = true)
    public boolean currentTenantHasFeature(FeatureKey featureKey) {
        return getCurrentTenantFeatures().contains(featureKey);
    }
}
