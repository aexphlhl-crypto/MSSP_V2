package com.mspportal.subscription;

import com.mspportal.subscription.entity.Plan;
import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.SubscriptionStatus;
import com.mspportal.subscription.interceptor.SubscriptionInterceptor;
import com.mspportal.subscription.repository.TenantSubscriptionRepository;
import com.mspportal.subscription.service.SubscriptionEntitlementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SubscriptionAuthorizationTest {

    private TenantSubscriptionRepository repository;
    private SubscriptionEntitlementService entitlementService;
    private SubscriptionInterceptor interceptor;

    @BeforeEach
    void setUp() {
        repository = mock(TenantSubscriptionRepository.class);
        entitlementService = new SubscriptionEntitlementService(repository);
        interceptor = new SubscriptionInterceptor(repository);
    }

    @Test
    void testEntitlementBronze() {
        TenantSubscription sub = new TenantSubscription();
        Plan plan = new Plan();
        plan.setName("BRONZE");
        sub.setPlan(plan);
        sub.setStartAt(Instant.now().minus(1, ChronoUnit.DAYS));
        sub.setEndAt(Instant.now().plus(10, ChronoUnit.DAYS));

        when(repository.findActiveSubscriptionByTenantId("tenant1", SubscriptionStatus.ACTIVE))
                .thenReturn(Optional.of(sub));

        assertTrue(entitlementService.hasEntitlement("tenant1", "TICKETING_BASIC"));
        assertFalse(entitlementService.hasEntitlement("tenant1", "SLA_REPORTING"));
    }

    @Test
    void testEntitlementGold() {
        TenantSubscription sub = new TenantSubscription();
        Plan plan = new Plan();
        plan.setName("GOLD");
        sub.setPlan(plan);
        sub.setStartAt(Instant.now().minus(1, ChronoUnit.DAYS));
        sub.setEndAt(Instant.now().plus(10, ChronoUnit.DAYS));

        when(repository.findActiveSubscriptionByTenantId("tenant2", SubscriptionStatus.ACTIVE))
                .thenReturn(Optional.of(sub));

        assertTrue(entitlementService.hasEntitlement("tenant2", "AI_INSIGHTS"));
    }

    @Test
    void testInterceptorExpiredContract() throws Exception {
        TenantSubscription sub = new TenantSubscription();
        sub.setStartAt(Instant.now().minus(10, ChronoUnit.DAYS));
        sub.setEndAt(Instant.now().minus(1, ChronoUnit.DAYS)); // EXPIRED

        when(repository.findActiveSubscriptionByTenantId("tenant3", SubscriptionStatus.ACTIVE))
                .thenReturn(Optional.of(sub));

        HttpServletRequest request = mock(HttpServletRequest.class);
        com.mspportal.common.tenant.TenantContext.setCurrentTenant("tenant3");

        HttpServletResponse response = mock(HttpServletResponse.class);

        boolean allowed = interceptor.preHandle(request, response, new Object());

        com.mspportal.common.tenant.TenantContext.clear();

        assertFalse(allowed);
        verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Subscription contract has expired");
    }
}
