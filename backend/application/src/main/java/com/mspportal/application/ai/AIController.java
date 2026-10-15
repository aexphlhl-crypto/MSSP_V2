package com.mspportal.application.ai;

import com.mspportal.backup.service.BackupAlertService;
import com.mspportal.monitoring.service.AlertService;
import com.mspportal.security.service.SecurityEventService;
import com.mspportal.ticketing.service.TicketService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@PreAuthorize("@entitlement.has('AI_ASSISTANT')")
public class AIController {

    private final MockAIAnalysisService aiAnalysisService;
    private final TicketService ticketService;
    private final SecurityEventService securityEventService;
    private final BackupAlertService backupAlertService;
    private final AlertService monitoringAlertService;

    public AIController(MockAIAnalysisService aiAnalysisService, TicketService ticketService, SecurityEventService securityEventService, BackupAlertService backupAlertService, AlertService monitoringAlertService) {
        this.aiAnalysisService = aiAnalysisService;
        this.ticketService = ticketService;
        this.securityEventService = securityEventService;
        this.backupAlertService = backupAlertService;
        this.monitoringAlertService = monitoringAlertService;
    }

    @PostMapping("/tickets/{id}/analyze")
    public AIAnalysisResult analyzeTicket(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return aiAnalysisService.analyzeTicket(ticketService.getTicket(id, tenantId));
    }

    @PostMapping("/security/events/{id}/analyze")
    public AIAnalysisResult analyzeSecurityEvent(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return aiAnalysisService.analyzeSecurityEvent(securityEventService.getEvent(id, tenantId));
    }

    @PostMapping("/backup/alerts/{id}/analyze")
    public AIAnalysisResult analyzeBackupAlert(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return aiAnalysisService.analyzeBackupAlert(backupAlertService.getAlert(id, tenantId));
    }

    @PostMapping("/monitoring/alerts/{id}/analyze")
    public AIAnalysisResult analyzeMonitoringAlert(@PathVariable UUID id, @RequestParam(required = false) String tenantId) {
        return aiAnalysisService.analyzeMonitoringAlert(monitoringAlertService.getAlert(id, tenantId));
    }
}
