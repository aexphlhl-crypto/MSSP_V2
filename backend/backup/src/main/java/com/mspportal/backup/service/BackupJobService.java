package com.mspportal.backup.service;

import com.mspportal.backup.dto.BackupJobResponse;
import com.mspportal.backup.dto.CreateBackupJobRequest;
import com.mspportal.backup.dto.UpdateBackupJobRequest;
import com.mspportal.backup.entity.BackupJob;
import com.mspportal.backup.enums.BackupJobStatus;
import com.mspportal.backup.repository.BackupJobRepository;
import com.mspportal.backup.repository.BackupRepositoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BackupJobService {

    private final BackupJobRepository backupJobRepository;
    private final BackupRepositoryRepository backupRepositoryRepository;
    private final BackupServiceHelper helper;

    public BackupJobService(BackupJobRepository backupJobRepository, BackupRepositoryRepository backupRepositoryRepository, BackupServiceHelper helper) {
        this.backupJobRepository = backupJobRepository;
        this.backupRepositoryRepository = backupRepositoryRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BackupJobResponse> listJobs(String requestedTenantId, org.springframework.data.domain.Pageable pageable, String search, BackupJobStatus status) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            org.springframework.data.jpa.domain.Specification<BackupJob> spec = org.springframework.data.jpa.domain.Specification.where(null);
            
            if (status != null) {
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
            }
            
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                spec = spec.and((root, query, cb) -> cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("sourceName")), searchPattern),
                        cb.like(cb.lower(root.get("sourceType")), searchPattern)
                ));
            }

            return backupJobRepository.findAll(spec, pageable).map(this::mapToResponse);
        });
    }

    @Transactional(readOnly = true)
    public BackupJobResponse getJob(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupJob job = backupJobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
            return mapToResponse(job);
        });
    }

    @Transactional
    public BackupJobResponse createJob(CreateBackupJobRequest request, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot create backup jobs");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            if (request.getRepositoryId() != null) {
                backupRepositoryRepository.findById(request.getRepositoryId()).orElseThrow(() -> new RuntimeException("Repository not found"));
            }

            BackupJob job = new BackupJob();
            job.setName(request.getName());
            job.setRepositoryId(request.getRepositoryId());
            job.setSourceType(request.getSourceType());
            job.setSourceName(request.getSourceName());
            job.setSchedule(request.getSchedule());
            job.setEnabled(request.isEnabled());
            job.setRetentionDays(request.getRetentionDays());
            job.setStatus(BackupJobStatus.ACTIVE);
            
            return mapToResponse(backupJobRepository.save(job));
        });
    }

    @Transactional
    public BackupJobResponse updateJob(UUID id, UpdateBackupJobRequest request, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot update backup jobs");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupJob job = backupJobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
            
            if (request.getName() != null) job.setName(request.getName());
            if (request.getRepositoryId() != null) {
                backupRepositoryRepository.findById(request.getRepositoryId()).orElseThrow(() -> new RuntimeException("Repository not found"));
                job.setRepositoryId(request.getRepositoryId());
            }
            if (request.getSourceType() != null) job.setSourceType(request.getSourceType());
            if (request.getSourceName() != null) job.setSourceName(request.getSourceName());
            if (request.getSchedule() != null) job.setSchedule(request.getSchedule());
            if (request.getEnabled() != null) job.setEnabled(request.getEnabled());
            if (request.getRetentionDays() != null) job.setRetentionDays(request.getRetentionDays());

            return mapToResponse(backupJobRepository.save(job));
        });
    }

    @Transactional
    public BackupJobResponse updateStatus(UUID id, BackupJobStatus status, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot update backup jobs");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupJob job = backupJobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
            job.setStatus(status);
            return mapToResponse(backupJobRepository.save(job));
        });
    }

    private BackupJobResponse mapToResponse(BackupJob j) {
        BackupJobResponse res = new BackupJobResponse();
        res.setId(j.getId());
        res.setTenantId(j.getTenantId());
        res.setName(j.getName());
        res.setRepositoryId(j.getRepositoryId());
        res.setSourceType(j.getSourceType());
        res.setSourceName(j.getSourceName());
        res.setSchedule(j.getSchedule());
        res.setEnabled(j.isEnabled());
        res.setRetentionDays(j.getRetentionDays());
        res.setLastRunAt(j.getLastRunAt());
        res.setNextRunAt(j.getNextRunAt());
        res.setStatus(j.getStatus());
        return res;
    }
}
