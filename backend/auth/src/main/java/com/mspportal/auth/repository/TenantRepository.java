package com.mspportal.auth.repository;

import com.mspportal.auth.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByTenantIdentifier(String tenantIdentifier);
}
