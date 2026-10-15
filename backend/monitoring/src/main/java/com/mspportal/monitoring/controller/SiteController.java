package com.mspportal.monitoring.controller;

import com.mspportal.monitoring.dto.CreateSiteRequest;
import com.mspportal.monitoring.dto.SiteResponse;
import com.mspportal.monitoring.dto.UpdateSiteRequest;
import com.mspportal.monitoring.service.SiteService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/monitoring/sites")
@PreAuthorize("@entitlement.has('MONITORING_BASIC')")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SiteResponse createSite(@Valid @RequestBody CreateSiteRequest request,
                                   @RequestParam(required = false) String tenantId) {
        return siteService.createSite(request, tenantId);
    }

    @GetMapping
    public List<SiteResponse> listSites(@RequestParam(required = false) String tenantId,
                                        @RequestParam(required = false) String status) {
        return siteService.listSites(tenantId, status);
    }

    @GetMapping("/{id}")
    public SiteResponse getSite(@PathVariable UUID id,
                                @RequestParam(required = false) String tenantId) {
        return siteService.getSite(id, tenantId);
    }

    @PatchMapping("/{id}")
    public SiteResponse updateSite(@PathVariable UUID id,
                                   @RequestBody UpdateSiteRequest request,
                                   @RequestParam(required = false) String tenantId) {
        return siteService.updateSite(id, request, tenantId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSite(@PathVariable UUID id,
                           @RequestParam(required = false) String tenantId) {
        siteService.deleteSite(id, tenantId);
    }
}
