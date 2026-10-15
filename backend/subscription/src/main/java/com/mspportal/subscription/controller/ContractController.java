package com.mspportal.subscription.controller;

import com.mspportal.subscription.dto.ContractResponse;
import com.mspportal.subscription.dto.ContractSummaryResponse;
import com.mspportal.subscription.service.ContractService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contracts")
@PreAuthorize("hasAnyRole('ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN')")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping
    public Page<ContractResponse> listContracts(
            @RequestParam(required = false) String tenantId,
            Pageable pageable) {
        return contractService.listContracts(tenantId, pageable);
    }

    @GetMapping("/summary")
    public ContractSummaryResponse getSummary(@RequestParam(required = false) String tenantId) {
        return contractService.getSummary(tenantId);
    }

    @GetMapping("/{id}")
    public ContractResponse getContract(
            @PathVariable UUID id,
            @RequestParam(required = false) String tenantId) {
        return contractService.getContract(id, tenantId);
    }
}
