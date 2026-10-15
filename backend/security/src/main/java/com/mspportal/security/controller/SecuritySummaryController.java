package com.mspportal.security.controller;

import com.mspportal.security.dto.SecuritySummaryResponse;
import com.mspportal.security.service.SecuritySummaryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/security/summary")
@PreAuthorize("@entitlement.has('SECURITY_BASIC')")
public class SecuritySummaryController {

    private final SecuritySummaryService summaryService;

    public SecuritySummaryController(SecuritySummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping
    public SecuritySummaryResponse getSummary(@RequestParam(required = false) String tenantId) {
        return summaryService.getSummary(tenantId);
    }
}
