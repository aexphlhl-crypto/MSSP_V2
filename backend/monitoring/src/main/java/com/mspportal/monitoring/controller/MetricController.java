package com.mspportal.monitoring.controller;

import com.mspportal.monitoring.dto.DeviceMetricResponse;
import com.mspportal.monitoring.service.MetricService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monitoring/devices/{deviceId}/metrics")
@PreAuthorize("@entitlement.has('MONITORING_BASIC')")
public class MetricController {

    private final MetricService metricService;

    public MetricController(MetricService metricService) {
        this.metricService = metricService;
    }

    @GetMapping
    public List<DeviceMetricResponse> getDeviceMetrics(@PathVariable UUID deviceId,
                                                       @RequestParam(required = false) String tenantId,
                                                       @RequestParam(required = false) String since) {
        if (since != null && !since.isBlank()) {
            java.time.Instant sinceInstant = java.time.Instant.parse(since);
            return metricService.getDeviceMetricsSince(deviceId, sinceInstant, tenantId);
        }
        return metricService.getDeviceMetrics(deviceId, tenantId);
    }

    @GetMapping("/latest")
    public DeviceMetricResponse getLatestMetric(@PathVariable UUID deviceId,
                                                @RequestParam(required = false) String tenantId) {
        return metricService.getLatestMetric(deviceId, tenantId);
    }
}
