package com.mspportal.backup.repository;

import com.mspportal.backup.entity.BackupExecution;
import com.mspportal.backup.enums.BackupExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BackupExecutionRepository extends JpaRepository<BackupExecution, UUID> {
    List<BackupExecution> findByJobIdOrderByStartedAtDesc(UUID jobId);
    Optional<BackupExecution> findFirstByJobIdOrderByStartedAtDesc(UUID jobId);
    List<BackupExecution> findByStatus(BackupExecutionStatus status);
}
