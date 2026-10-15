package com.mspportal.ticketing.controller;

import com.mspportal.ticketing.dto.SlaPolicyResponse;
import com.mspportal.ticketing.dto.SlaSummaryResponse;
import com.mspportal.ticketing.service.SlaPolicyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sla")
@PreAuthorize("@entitlement.has('TICKETING')")
public class SlaPolicyController {

    private final SlaPolicyService slaPolicyService;

    public SlaPolicyController(SlaPolicyService slaPolicyService) {
        this.slaPolicyService = slaPolicyService;
    }

    @GetMapping
    public Page<SlaPolicyResponse> listPolicies(
            @RequestParam(required = false) String tenantId,
            Pageable pageable) {
        return slaPolicyService.listPolicies(tenantId, pageable);
    }

    @GetMapping("/summary")
    public SlaSummaryResponse getSummary(@RequestParam(required = false) String tenantId) {
        return slaPolicyService.getSummary(tenantId);
    }

    @GetMapping("/{id}")
    public SlaPolicyResponse getPolicy(
            @PathVariable UUID id,
            @RequestParam(required = false) String tenantId) {
        return slaPolicyService.getPolicy(id, tenantId);
    }
}
