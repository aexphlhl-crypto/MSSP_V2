package com.mspportal.monitoring.controller;

import com.mspportal.monitoring.dto.MonitoringSummaryResponse;
import com.mspportal.monitoring.service.MonitoringSummaryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/monitoring/summary")
@PreAuthorize("@entitlement.has('MONITORING_BASIC')")
public class MonitoringSummaryController {

    private final MonitoringSummaryService summaryService;

    public MonitoringSummaryController(MonitoringSummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping
    public MonitoringSummaryResponse getSummary(@RequestParam(required = false) String tenantId) {
        return summaryService.getSummary(tenantId);
    }
}
