package com.mspportal.backup.repository;

import com.mspportal.backup.entity.BackupRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BackupRepositoryRepository extends JpaRepository<BackupRepository, UUID>, JpaSpecificationExecutor<BackupRepository> {
}

