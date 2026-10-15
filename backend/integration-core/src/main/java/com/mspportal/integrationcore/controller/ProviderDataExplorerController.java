package com.mspportal.integrationcore.controller;

import com.mspportal.integrationcore.service.ProviderDataExplorerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
public class ProviderDataExplorerController {

    private final ProviderDataExplorerService providerDataExplorerService;

    @GetMapping("/{id}/data")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getProviderData(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(providerDataExplorerService.getProviderData(id, pageable));
    }
}
