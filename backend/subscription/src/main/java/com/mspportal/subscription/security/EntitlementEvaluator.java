package com.mspportal.subscription.security;

import com.mspportal.subscription.enums.FeatureKey;
import com.mspportal.subscription.service.SubscriptionService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("entitlement")
public class EntitlementEvaluator {

    private final SubscriptionService subscriptionService;

    public EntitlementEvaluator(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    public boolean has(String featureString) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"))) {
            // Platform admin bypasses subscription feature restrictions
            return true;
        }

        try {
            FeatureKey featureKey = FeatureKey.valueOf(featureString);
            return subscriptionService.currentTenantHasFeature(featureKey);
        } catch (IllegalArgumentException e) {
            // Unknown feature key
            return false;
        }
    }
}
