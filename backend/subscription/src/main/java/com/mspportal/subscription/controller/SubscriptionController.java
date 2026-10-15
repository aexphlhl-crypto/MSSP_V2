package com.mspportal.subscription.controller;

import com.mspportal.subscription.dto.FeatureListResponse;
import com.mspportal.subscription.dto.MySubscriptionResponse;
import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.FeatureKey;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import com.mspportal.common.tenant.TenantContext;
import com.mspportal.subscription.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;

    public SubscriptionController(SubscriptionService subscriptionService, TenantSubscriptionRepository tenantSubscriptionRepository) {
        this.subscriptionService = subscriptionService;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
    }

    @GetMapping("/my-features")
    public ResponseEntity<FeatureListResponse> getMyFeatures() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        boolean isPlatformAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
        
        Set<FeatureKey> features;
        if (isPlatformAdmin) {
            features = EnumSet.allOf(FeatureKey.class);
        } else {
            features = subscriptionService.getCurrentTenantFeatures();
        }

        return ResponseEntity.ok(new FeatureListResponse(features, isPlatformAdmin));
    }

    @GetMapping("/my-subscription")
    public ResponseEntity<MySubscriptionResponse> getMySubscription() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPlatformAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));

        String tenantId = TenantContext.getCurrentTenant();
        
        if (isPlatformAdmin) {
            return ResponseEntity.ok(new MySubscriptionResponse(
                    "Platform Admin Plan",
                    com.mspportal.subscription.enums.SubscriptionStatus.ACTIVE,
                    java.time.Instant.now(),
                    null,
                    EnumSet.allOf(FeatureKey.class),
                    true
            ));
        }

        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<TenantSubscription> subOpt = tenantSubscriptionRepository.findActiveSubscriptionByTenantId(tenantId, com.mspportal.subscription.enums.SubscriptionStatus.ACTIVE);
        
        if (subOpt.isEmpty()) {
            return ResponseEntity.ok(new MySubscriptionResponse(
                    "No Plan",
                    com.mspportal.subscription.enums.SubscriptionStatus.CANCELED,
                    null,
                    null,
                    Collections.emptySet(),
                    false
            ));
        }

        TenantSubscription sub = subOpt.get();
        return ResponseEntity.ok(new MySubscriptionResponse(
                sub.getPlan().getName(),
                sub.getStatus(),
                sub.getStartAt(),
                sub.getEndAt(),
                sub.getPlan().getFeatures(),
                false
        ));
    }
}
