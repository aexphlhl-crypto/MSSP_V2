package com.mspportal.security.controller;

import com.mspportal.security.dto.SecurityEndpointResponse;
import com.mspportal.security.service.SecurityEndpointService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import com.mspportal.security.enums.EndpointProtectionStatus;

@RestController
@RequestMapping("/api/v1/security/endpoints")
@PreAuthorize("@entitlement.has('SECURITY_ENDPOINT')")
public class SecurityEndpointController {

    private final SecurityEndpointService endpointService;

    public SecurityEndpointController(SecurityEndpointService endpointService) {
        this.endpointService = endpointService;
    }

    @GetMapping
    public Page<SecurityEndpointResponse> listEndpoints(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EndpointProtectionStatus protectionStatus,
            @PageableDefault(sort = {"lastCheckAt", "createdAt"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return endpointService.listEndpoints(tenantId, pageable, protectionStatus, search);
    }

    @GetMapping("/{id}")
    public SecurityEndpointResponse getEndpoint(@PathVariable UUID id,
                                                @RequestParam(required = false) String tenantId) {
        return endpointService.getEndpoint(id, tenantId);
    }
}
