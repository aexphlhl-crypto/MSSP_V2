package com.mspportal.backup.service;

import com.mspportal.backup.dto.BackupExecutionResponse;
import com.mspportal.backup.entity.BackupAlert;
import com.mspportal.backup.entity.BackupExecution;
import com.mspportal.backup.entity.BackupJob;
import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
import com.mspportal.backup.enums.BackupExecutionStatus;
import com.mspportal.backup.mock.MockBackupService;
import com.mspportal.backup.repository.BackupAlertRepository;
import com.mspportal.backup.repository.BackupExecutionRepository;
import com.mspportal.backup.repository.BackupJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BackupExecutionService {

    private final BackupExecutionRepository executionRepository;
    private final BackupJobRepository jobRepository;
    private final BackupAlertRepository alertRepository;
    private final MockBackupService mockBackupService;
    private final BackupServiceHelper helper;

    public BackupExecutionService(BackupExecutionRepository executionRepository, BackupJobRepository jobRepository, BackupAlertRepository alertRepository, MockBackupService mockBackupService, BackupServiceHelper helper) {
        this.executionRepository = executionRepository;
        this.jobRepository = jobRepository;
        this.alertRepository = alertRepository;
        this.mockBackupService = mockBackupService;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public List<BackupExecutionResponse> listExecutions(UUID jobId, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
            return executionRepository.findByJobIdOrderByStartedAtDesc(jobId).stream().map(this::mapToResponse).collect(Collectors.toList());
        });
    }

    @Transactional(readOnly = true)
    public BackupExecutionResponse getExecution(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupExecution exec = executionRepository.findById(id).orElseThrow(() -> new RuntimeException("Execution not found"));
            return mapToResponse(exec);
        });
    }

    @Transactional
    public BackupExecutionResponse runJob(UUID jobId, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot trigger backups");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupJob job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Mock execution
            BackupExecution exec = mockBackupService.simulateBackupExecution(job.getId(), job.getSourceName(), job.getTenantId());
            exec = executionRepository.save(exec);
            
            job.setLastRunAt(exec.getStartedAt());
            jobRepository.save(job);

            if (exec.getStatus() == BackupExecutionStatus.FAILED) {
                BackupAlert alert = new BackupAlert();
                alert.setJobId(job.getId());
                alert.setSeverity(BackupAlertSeverity.CRITICAL);
                alert.setStatus(BackupAlertStatus.OPEN);
                alert.setTitle("Backup Job Failed: " + job.getName());
                alert.setMessage(exec.getErrorMessage());
                alertRepository.save(alert);
            }

            return mapToResponse(exec);
        });
    }

    private BackupExecutionResponse mapToResponse(BackupExecution e) {
        BackupExecutionResponse res = new BackupExecutionResponse();
        res.setId(e.getId());
        res.setTenantId(e.getTenantId());
        res.setJobId(e.getJobId());
        res.setStartedAt(e.getStartedAt());
        res.setFinishedAt(e.getFinishedAt());
        res.setStatus(e.getStatus());
        res.setDurationSeconds(e.getDurationSeconds());
        res.setDataTransferredBytes(e.getDataTransferredBytes());
        res.setErrorMessage(e.getErrorMessage());
        return res;
    }
}
