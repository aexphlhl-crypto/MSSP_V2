package com.mspportal.subscription.interceptor;

import com.mspportal.subscription.enums.SubscriptionStatus;
import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class SubscriptionInterceptor implements HandlerInterceptor {
    
    private final TenantSubscriptionRepository repository;

    public SubscriptionInterceptor(TenantSubscriptionRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"))) {
            return true;
        }

        String tenantId = com.mspportal.common.tenant.TenantContext.getCurrentTenant();
        if (tenantId != null) {
            Optional<TenantSubscription> subOpt = repository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
            if (subOpt.isEmpty()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Active subscription/contract required or suspended");
                return false;
            }
            
            TenantSubscription sub = subOpt.get();
            java.time.Instant now = java.time.Instant.now();
            if (sub.getStartAt() != null && sub.getStartAt().isAfter(now)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Subscription contract has not started yet");
                return false;
            }
            if (sub.getEndAt() != null && sub.getEndAt().isBefore(now)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Subscription contract has expired");
                return false;
            }
        }
        return true;
    }
}
