package com.mspportal.security.controller;

import com.mspportal.security.dto.SecurityEventResponse;
import com.mspportal.security.service.SecurityEventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventStatus;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/security/events")
@PreAuthorize("@entitlement.has('SECURITY_ALERTS')")
public class SecurityEventController {

    private final SecurityEventService eventService;

    public SecurityEventController(SecurityEventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public Page<SecurityEventResponse> listEvents(@RequestParam(required = false) String tenantId,
                                                  @RequestParam(required = false) SecurityEventSeverity severity,
                                                  @RequestParam(required = false) SecurityEventStatus status,
                                                  @RequestParam(required = false) String provider,
                                                  @RequestParam(required = false) String search,
                                                  @PageableDefault(sort = {"detectedAt", "createdAt"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return eventService.listEvents(tenantId, pageable, severity, status, provider, search);
    }

    @GetMapping("/{id}")
    public SecurityEventResponse getEvent(@PathVariable UUID id,
                                          @RequestParam(required = false) String tenantId) {
        return eventService.getEvent(id, tenantId);
    }

    @PatchMapping("/{id}/acknowledge")
    public SecurityEventResponse acknowledgeEvent(@PathVariable UUID id,
                                                  @RequestParam(required = false) String tenantId) {
        return eventService.acknowledgeEvent(id, tenantId);
    }

    @PatchMapping("/{id}/resolve")
    public SecurityEventResponse resolveEvent(@PathVariable UUID id,
                                              @RequestParam(required = false) String tenantId) {
        return eventService.resolveEvent(id, tenantId);
    }
}
