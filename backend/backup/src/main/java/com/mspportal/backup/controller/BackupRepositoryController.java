package com.mspportal.backup.controller;

import com.mspportal.backup.dto.BackupRepositoryResponse;
import com.mspportal.backup.dto.CreateBackupRepositoryRequest;
import com.mspportal.backup.dto.UpdateBackupRepositoryRequest;
import com.mspportal.backup.service.BackupRepositoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/backup/repositories")
@PreAuthorize("@entitlement.has('BACKUP_BASIC')")
public class BackupRepositoryController {

    private final BackupRepositoryService repositoryService;

    public BackupRepositoryController(BackupRepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @GetMapping
    public org.springframework.data.domain.Page<BackupRepositoryResponse> listRepositories(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.mspportal.backup.enums.BackupRepositoryType type,
            @RequestParam(required = false) com.mspportal.backup.enums.BackupRepositoryStatus status,
            @org.springframework.data.web.PageableDefault(sort = {"name"}, direction = org.springframework.data.domain.Sort.Direction.ASC) org.springframework.data.domain.Pageable pageable) {
        return repositoryService.listRepositories(tenantId, pageable, search, type, status);
    }

    @GetMapping("/summary")
    public com.mspportal.backup.dto.BackupRepositorySummary getSummary(@RequestParam(required = false) String tenantId) {
        return repositoryService.getSummary(tenantId);
    }

    @GetMapping("/{id}")
    public BackupRepositoryResponse getRepository(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return repositoryService.getRepository(id, tenantId);
    }

    @PostMapping
    public BackupRepositoryResponse createRepository(@RequestBody CreateBackupRepositoryRequest request, @RequestParam(required = false) String tenantId) {
        return repositoryService.createRepository(request, tenantId);
    }

    @PatchMapping("/{id}")
    public BackupRepositoryResponse updateRepository(@PathVariable UUID id, @RequestBody UpdateBackupRepositoryRequest request, @RequestParam(required = false) String tenantId) {
        return repositoryService.updateRepository(id, request, tenantId);
    }
}
