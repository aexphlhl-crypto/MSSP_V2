package com.mspportal.backup.controller;

import com.mspportal.backup.dto.BackupSummaryResponse;
import com.mspportal.backup.service.BackupSummaryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/backup/summary")
@PreAuthorize("@entitlement.has('BACKUP_BASIC')")
public class BackupSummaryController {

    private final BackupSummaryService summaryService;

    public BackupSummaryController(BackupSummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping
    public BackupSummaryResponse getSummary(@RequestParam(required = false) String tenantId) {
        return summaryService.getSummary(tenantId);
    }
}
