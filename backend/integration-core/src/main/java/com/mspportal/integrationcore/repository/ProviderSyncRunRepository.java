package com.mspportal.integrationcore.repository;

import com.mspportal.integrationcore.entity.ProviderSyncRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProviderSyncRunRepository extends JpaRepository<ProviderSyncRun, UUID> {
}
