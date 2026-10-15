package com.mspportal.backup.controller;

import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.backup.enums.BackupAlertSeverity;
import com.mspportal.backup.enums.BackupAlertStatus;
import com.mspportal.backup.service.BackupAlertService;
import com.mspportal.backup.service.BackupAlertSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/backup/alerts")
@PreAuthorize("@entitlement.has('BACKUP_ALERTS')")
public class BackupAlertController {

    private final BackupAlertService alertService;

    public BackupAlertController(BackupAlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/summary")
    public BackupAlertSummary getSummary(@RequestParam(required = false) String tenantId) {
        return alertService.getSummary(tenantId);
    }

    @GetMapping
    public Page<BackupAlertResponse> listAlerts(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BackupAlertStatus status,
            @RequestParam(required = false) BackupAlertSeverity severity,
            @PageableDefault(sort = {"createdAt"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return alertService.listAlerts(tenantId, pageable, search, status, severity);
    }

    @GetMapping("/{id}")
    public BackupAlertResponse getAlert(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return alertService.getAlert(id, tenantId);
    }

    @PatchMapping("/{id}/acknowledge")
    public BackupAlertResponse acknowledgeAlert(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return alertService.acknowledgeAlert(id, tenantId);
    }

    @PatchMapping("/{id}/resolve")
    public BackupAlertResponse resolveAlert(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return alertService.resolveAlert(id, tenantId);
    }
}
