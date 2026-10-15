package com.mspportal.integrationcore.action;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProviderActionRepository extends JpaRepository<ProviderAction, UUID> {
    List<ProviderAction> findByTenantId(UUID tenantId);
}
