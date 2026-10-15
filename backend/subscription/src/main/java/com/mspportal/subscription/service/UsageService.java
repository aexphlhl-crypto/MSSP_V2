package com.mspportal.subscription.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.subscription.dto.UsageCategoryResponse;
import com.mspportal.subscription.dto.UsageResponse;
import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.SubscriptionStatus;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import jakarta.persistence.EntityManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsageService {

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final EntityManager entityManager;

    public UsageService(TenantSubscriptionRepository tenantSubscriptionRepository, EntityManager entityManager) {
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.entityManager = entityManager;
    }

    private boolean isPlatformUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN")
                        || a.getAuthority().equals("ROLE_PLATFORM_TECH"));
    }

    private String getEffectiveTenantId(String requestedTenantId) {
        if (isPlatformUser() && requestedTenantId != null && !requestedTenantId.isBlank()) {
            return requestedTenantId;
        }
        return TenantContext.getCurrentTenant();
    }

    private long getNativeCount(String sql, String tenantId) {
        try {
            Number result = (Number) entityManager.createNativeQuery(sql)
                    .setParameter("tenantId", tenantId)
                    .getSingleResult();
            return result != null ? result.longValue() : 0L;
        } catch (Exception e) {
            // Table might not exist or other DB issues - safety fallback
            return 0L;
        }
    }

    @Transactional(readOnly = true)
    public UsageResponse getUsage(String requestedTenantId) {
        String tenantId = getEffectiveTenantId(requestedTenantId);
        if (tenantId == null) {
            return new UsageResponse("No Active Plan", new ArrayList<>());
        }

        Optional<TenantSubscription> subOpt = tenantSubscriptionRepository.findActiveSubscriptionByTenantId(tenantId, SubscriptionStatus.ACTIVE);
        String planName = subOpt.isPresent() ? subOpt.get().getPlan().getName() : "Bronze";

        // Query usages
        long backupJobs = getNativeCount("SELECT COUNT(*) FROM backup_jobs WHERE tenant_id = :tenantId", tenantId);
        long backupStorage = getNativeCount("SELECT COALESCE(SUM(used_bytes), 0) FROM backup_repositories WHERE tenant_id = :tenantId", tenantId);
        long protectedEndpoints = getNativeCount("SELECT COUNT(*) FROM security_endpoints WHERE tenant_id = :tenantId", tenantId);
        long sites = getNativeCount("SELECT COUNT(*) FROM sites WHERE tenant_id = :tenantId", tenantId);
        long users = getNativeCount("SELECT COUNT(*) FROM users WHERE tenant_identifier = :tenantId", tenantId);
        long tickets = getNativeCount("SELECT COUNT(*) FROM tickets WHERE tenant_id = :tenantId", tenantId);

        // Configure limits based on plan name
        long storageLimit = 100 * 1024 * 1024 * 1024L; // 100 GB default
        long jobsLimit = 2L;
        long endpointsLimit = 5L;
        long sitesLimit = 2L;
        long usersLimit = 3L;
        long ticketsLimit = 20L;

        if ("Silver".equalsIgnoreCase(planName)) {
            storageLimit = 1000 * 1024 * 1024 * 1024L; // 1 TB
            jobsLimit = 10L;
            endpointsLimit = 50L;
            sitesLimit = 10L;
            usersLimit = 20L;
            ticketsLimit = 200L;
        } else if ("Gold".equalsIgnoreCase(planName)) {
            storageLimit = -1L; // Unlimited
            jobsLimit = -1L;
            endpointsLimit = -1L;
            sitesLimit = -1L;
            usersLimit = -1L;
            ticketsLimit = -1L;
        }

        List<UsageCategoryResponse> categories = new ArrayList<>();
        categories.add(createCategory("Backup Storage", backupStorage, storageLimit, "Bytes"));
        categories.add(createCategory("Backup Jobs", backupJobs, jobsLimit, "Count"));
        categories.add(createCategory("Protected Endpoints", protectedEndpoints, endpointsLimit, "Count"));
        categories.add(createCategory("Sites", sites, sitesLimit, "Count"));
        categories.add(createCategory("Users", users, usersLimit, "Count"));
        categories.add(createCategory("Tickets", tickets, ticketsLimit, "Count"));

        return new UsageResponse(planName, categories);
    }

    private UsageCategoryResponse createCategory(String name, long used, long limit, String unit) {
        Double utilization = null;
        if (limit > 0) {
            utilization = ((double) used / limit) * 100.0;
        }
        return new UsageCategoryResponse(name, used, limit <= 0 ? null : limit, unit, utilization);
    }
}
