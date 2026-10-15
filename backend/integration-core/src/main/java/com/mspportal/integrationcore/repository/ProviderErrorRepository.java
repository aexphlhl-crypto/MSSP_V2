package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProviderErrorRepository extends JpaRepository<ProviderError, UUID> {
    List<ProviderError> findBySyncRunId(UUID syncRunId);
    List<ProviderError> findByProviderConnectionId(UUID providerConnectionId);
}
