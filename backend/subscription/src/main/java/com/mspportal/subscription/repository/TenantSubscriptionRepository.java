package com.mspportal.subscription.repository;

import com.mspportal.subscription.entity.TenantSubscription;
import com.mspportal.subscription.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, UUID> {
    
    @Query("SELECT ts FROM TenantSubscription ts WHERE ts.tenantId = :tenantId AND ts.status = :status")
    Optional<TenantSubscription> findActiveSubscriptionByTenantId(@Param("tenantId") String tenantId, @Param("status") SubscriptionStatus status);
}
