package com.mspportal.backup.service;

import com.mspportal.backup.dto.BackupSummaryResponse;
import com.mspportal.backup.entity.BackupExecution;
import com.mspportal.backup.entity.BackupRepository;
import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
import com.mspportal.backup.enums.BackupExecutionStatus;
import com.mspportal.backup.enums.BackupRepositoryStatus;
import com.mspportal.backup.repository.BackupAlertRepository;
import com.mspportal.backup.repository.BackupExecutionRepository;
import com.mspportal.backup.repository.BackupJobRepository;
import com.mspportal.backup.repository.BackupRepositoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BackupSummaryService {

    private final BackupRepositoryRepository repositoryRepository;
    private final BackupJobRepository jobRepository;
    private final BackupExecutionRepository executionRepository;
    private final BackupAlertRepository alertRepository;
    private final BackupServiceHelper helper;

    public BackupSummaryService(BackupRepositoryRepository repositoryRepository, BackupJobRepository jobRepository, BackupExecutionRepository executionRepository, BackupAlertRepository alertRepository, BackupServiceHelper helper) {
        this.repositoryRepository = repositoryRepository;
        this.jobRepository = jobRepository;
        this.executionRepository = executionRepository;
        this.alertRepository = alertRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public BackupSummaryResponse getSummary(String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            
            List<BackupRepository> repos = repositoryRepository.findAll();
            long totalRepositories = repos.size();
            long onlineRepositories = repos.stream().filter(r -> r.getStatus() == BackupRepositoryStatus.ONLINE).count();
            
            long storageCapacity = repos.stream().mapToLong(r -> r.getCapacityBytes() != null ? r.getCapacityBytes() : 0L).sum();
            long storageUsed = repos.stream().mapToLong(r -> r.getUsedBytes() != null ? r.getUsedBytes() : 0L).sum();

            long totalJobs = jobRepository.count();
            
            List<BackupExecution> execs = executionRepository.findAll();
            long runningJobs = execs.stream().filter(e -> e.getStatus() == BackupExecutionStatus.RUNNING).count();
            long successfulJobs = execs.stream().filter(e -> e.getStatus() == BackupExecutionStatus.SUCCESS).count();
            long failedJobs = execs.stream().filter(e -> e.getStatus() == BackupExecutionStatus.FAILED).count();
            
            long openAlerts = alertRepository.findByStatus(BackupAlertStatus.OPEN).size();
            long criticalAlerts = alertRepository.findByStatusAndSeverity(BackupAlertStatus.OPEN, BackupAlertSeverity.CRITICAL).size();

            BackupSummaryResponse res = new BackupSummaryResponse();
            res.setTotalRepositories(totalRepositories);
            res.setOnlineRepositories(onlineRepositories);
            res.setTotalJobs(totalJobs);
            res.setSuccessfulJobs(successfulJobs);
            res.setFailedJobs(failedJobs);
            res.setRunningJobs(runningJobs);
            res.setWarningJobs(0);
            res.setCriticalAlerts(criticalAlerts);
            res.setOpenAlerts(openAlerts);
            res.setStorageCapacity(storageCapacity);
            res.setStorageUsed(storageUsed);

            return res;
        });
    }
}
