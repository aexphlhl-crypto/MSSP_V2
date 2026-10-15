package com.mspportal.backup.mock;

import com.mspportal.backup.entity.BackupExecution;
import com.mspportal.backup.enums.BackupExecutionStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class MockBackupService {

    public BackupExecution simulateBackupExecution(UUID jobId, String sourceName, String tenantId) {
        BackupExecution execution = new BackupExecution();
        execution.setJobId(jobId);
        execution.setTenantId(tenantId);
        execution.setStartedAt(Instant.now());
        
        String sn = sourceName != null ? sourceName.toUpperCase() : "";
        
        if (sn.contains("CRITICAL")) {
            execution.setStatus(BackupExecutionStatus.FAILED);
            execution.setFinishedAt(Instant.now().plus(2, ChronoUnit.MINUTES));
            execution.setDurationSeconds(120L);
            execution.setDataTransferredBytes(50000000L); // 50MB
            execution.setErrorMessage("VSS snapshot failed on source volume.");
        } else if (sn.contains("RUNNING")) {
            execution.setStatus(BackupExecutionStatus.RUNNING);
        } else {
            execution.setStatus(BackupExecutionStatus.SUCCESS);
            execution.setFinishedAt(Instant.now().plus(15, ChronoUnit.MINUTES));
            execution.setDurationSeconds(900L);
            execution.setDataTransferredBytes(1024L * 1024L * 1024L * 5L); // 5GB
        }
        
        return execution;
    }
}
