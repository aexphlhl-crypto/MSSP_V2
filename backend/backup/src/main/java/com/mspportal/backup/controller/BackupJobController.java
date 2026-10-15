package com.mspportal.backup.controller;

import com.mspportal.backup.dto.BackupJobResponse;
import com.mspportal.backup.dto.CreateBackupJobRequest;
import com.mspportal.backup.dto.UpdateBackupJobRequest;
import com.mspportal.backup.service.BackupJobService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/backup/jobs")
@PreAuthorize("@entitlement.has('BACKUP_JOBS')")
public class BackupJobController {

    private final BackupJobService jobService;

    public BackupJobController(BackupJobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public org.springframework.data.domain.Page<BackupJobResponse> listJobs(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.mspportal.backup.enums.BackupJobStatus status,
            @org.springframework.data.web.PageableDefault(sort = {"lastRunAt"}, direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        return jobService.listJobs(tenantId, pageable, search, status);
    }

    @GetMapping("/{id}")
    public BackupJobResponse getJob(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return jobService.getJob(id, tenantId);
    }

    @PostMapping
    public BackupJobResponse createJob(@RequestBody CreateBackupJobRequest request, @RequestParam(required = false) String tenantId) {
        return jobService.createJob(request, tenantId);
    }

    @PatchMapping("/{id}")
    public BackupJobResponse updateJob(@PathVariable UUID id, @RequestBody UpdateBackupJobRequest request, @RequestParam(required = false) String tenantId) {
        return jobService.updateJob(id, request, tenantId);
    }
}
