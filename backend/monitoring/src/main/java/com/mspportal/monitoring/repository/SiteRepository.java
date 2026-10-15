package com.mspportal.monitoring.repository;

import com.mspportal.monitoring.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByStatus(String status);
    Optional<Site> findByIdAndTenantId(UUID id, String tenantId);
}
