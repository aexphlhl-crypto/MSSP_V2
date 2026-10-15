package com.mspportal.backup.repository;

import com.mspportal.backup.entity.BackupJob;
import com.mspportal.backup.enums.BackupJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BackupJobRepository extends JpaRepository<BackupJob, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<BackupJob> {
    List<BackupJob> findByStatus(BackupJobStatus status);
}
