package com.mspportal.monitoring.controller;

import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.monitoring.service.AlertService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monitoring/alerts")
@PreAuthorize("@entitlement.has('MONITORING_ALERTS')")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertResponse> listAlerts(@RequestParam(required = false) String tenantId,
                                          @RequestParam(required = false) UUID siteId) {
        return alertService.listAlerts(tenantId, siteId);
    }

    @GetMapping("/{id}")
    public AlertResponse getAlert(@PathVariable UUID id,
                                  @RequestParam(required = false) String tenantId) {
        return alertService.getAlert(id, tenantId);
    }

    @PatchMapping("/{id}/acknowledge")
    public AlertResponse acknowledgeAlert(@PathVariable UUID id,
                                          @RequestParam(required = false) String tenantId) {
        return alertService.acknowledgeAlert(id, tenantId);
    }

    @PatchMapping("/{id}/resolve")
    public AlertResponse resolveAlert(@PathVariable UUID id,
                                      @RequestParam(required = false) String tenantId) {
        return alertService.resolveAlert(id, tenantId);
    }
}
