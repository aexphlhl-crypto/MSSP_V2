package com.mspportal.monitoring.controller;

import com.mspportal.integrationcore.dto.ProviderDataResponse;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.monitoring.service.ProviderDataService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monitoring/devices/{deviceId}/provider-data")
@PreAuthorize("@entitlement.has('MONITORING_ADVANCED')")
public class ProviderDataController {

    private final ProviderDataService providerDataService;

    public ProviderDataController(ProviderDataService providerDataService) {
        this.providerDataService = providerDataService;
    }

    @GetMapping
    public ProviderDataResponse getProviderData(
            @PathVariable UUID deviceId,
            @RequestParam ProviderCapability capability,
            @RequestParam(required = false) String tenantId) {
        return providerDataService.getProviderData(deviceId, capability, tenantId);
    }
}
