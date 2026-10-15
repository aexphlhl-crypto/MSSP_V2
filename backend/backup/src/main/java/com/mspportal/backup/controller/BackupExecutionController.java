package com.mspportal.backup.controller;

import com.mspportal.backup.dto.BackupExecutionResponse;
import com.mspportal.backup.service.BackupExecutionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/backup")
@PreAuthorize("@entitlement.has('BACKUP_JOBS')")
public class BackupExecutionController {

    private final BackupExecutionService executionService;

    public BackupExecutionController(BackupExecutionService executionService) {
        this.executionService = executionService;
    }

    @GetMapping("/jobs/{jobId}/executions")
    public List<BackupExecutionResponse> listExecutions(@PathVariable UUID jobId, @RequestParam(required = false) String tenantId) {
        return executionService.listExecutions(jobId, tenantId);
    }

    @GetMapping("/executions/{id}")
    public BackupExecutionResponse getExecution(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return executionService.getExecution(id, tenantId);
    }

    @PostMapping("/jobs/{jobId}/run")
    public BackupExecutionResponse runJob(@PathVariable UUID jobId, @RequestParam(required = false) String tenantId) {
        return executionService.runJob(jobId, tenantId);
    }
}
