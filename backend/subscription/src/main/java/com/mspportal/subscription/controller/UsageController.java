package com.mspportal.subscription.controller;

import com.mspportal.subscription.dto.UsageResponse;
import com.mspportal.subscription.service.UsageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usage")
@PreAuthorize("hasAnyRole('ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN')")
public class UsageController {

    private final UsageService usageService;

    public UsageController(UsageService usageService) {
        this.usageService = usageService;
    }

    @GetMapping
    public UsageResponse getUsage(@RequestParam(required = false) String tenantId) {
        return usageService.getUsage(tenantId);
    }
}
