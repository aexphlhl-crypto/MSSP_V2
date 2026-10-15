package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
public class MonitoringServiceHelper {

    public boolean isPlatformUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || a.getAuthority().equals("ROLE_PLATFORM_TECH"));
    }

    public boolean isPlatformAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
    }
    
    public boolean isCustomerAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER_ADMIN"));
    }

    public String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }

    public <T> T withTenantImpersonationResult(String requestedTenantId, Supplier<T> action) {
        if (requestedTenantId == null || requestedTenantId.trim().isEmpty()) {
            return action.get();
        }

        if (!isPlatformUser()) {
            return action.get();
        }

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(requestedTenantId);
            return action.get();
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }
}
