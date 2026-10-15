package com.mspportal.application.operations;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/operations")
@RequiredArgsConstructor
public class OperationsController {

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'MSP_ADMIN')")
    public ResponseEntity<Map<String, Object>> getOperationsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // Mocked or aggregated data from various domains
        Map<String, Object> health = new HashMap<>();
        health.put("status", "HEALTHY");
        health.put("activeAlerts", 5);
        summary.put("health", health);

        Map<String, Object> incidents = new HashMap<>();
        incidents.put("activeIncidents", 2);
        incidents.put("criticalIncidents", 1);
        summary.put("incidents", incidents);

        Map<String, Object> backupStats = new HashMap<>();
        backupStats.put("successfulJobs", 42);
        backupStats.put("failedJobs", 1);
        backupStats.put("protectedEndpoints", 150);
        summary.put("backupStats", backupStats);

        Map<String, Object> securityStats = new HashMap<>();
        securityStats.put("activeThreats", 0);
        securityStats.put("vulnerabilitiesFound", 12);
        summary.put("securityStats", securityStats);

        return ResponseEntity.ok(summary);
    }
}
