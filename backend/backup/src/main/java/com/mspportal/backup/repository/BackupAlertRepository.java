package com.mspportal.backup.repository;

import com.mspportal.backup.entity.BackupAlert;
import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BackupAlertRepository extends JpaRepository<BackupAlert, UUID>, JpaSpecificationExecutor<BackupAlert> {
    List<BackupAlert> findByStatus(BackupAlertStatus status);
    List<BackupAlert> findByStatusAndSeverity(BackupAlertStatus status, BackupAlertSeverity severity);
}
