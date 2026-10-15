package com.mspportal.integrationcore.controller;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.dto.DiscoveredResource;
import com.mspportal.integrationcore.dto.ProviderConnectionRequest;
import com.mspportal.integrationcore.dto.ProviderConnectionResponse;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.credential.ProviderCredentialManager;
import com.mspportal.integrationcore.service.ProviderDiscoveryService;
import com.mspportal.integrationcore.service.ProviderHealthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/providers")
public class ProviderConnectionController {

    private final ProviderHealthService providerHealthService;
    private final ProviderDiscoveryService providerDiscoveryService;
    private final ProviderConnectionRepository connectionRepository;
    private final ProviderCredentialManager credentialManager;

    public ProviderConnectionController(ProviderHealthService providerHealthService,
                                        ProviderDiscoveryService providerDiscoveryService,
                                        ProviderConnectionRepository connectionRepository,
                                        ProviderCredentialManager credentialManager) {
        this.providerHealthService = providerHealthService;
        this.providerDiscoveryService = providerDiscoveryService;
        this.connectionRepository = connectionRepository;
        this.credentialManager = credentialManager;
    }

    @GetMapping
    public ResponseEntity<List<ProviderConnectionResponse>> listConnections() {
        String currentTenant = TenantContext.getCurrentTenant();
        if (currentTenant == null) {
            throw new AccessDeniedException("No active tenant context");
        }
        
        List<ProviderConnection> list = connectionRepository.findAll();
        List<ProviderConnectionResponse> responses = list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderConnectionResponse> getConnection(@PathVariable UUID id) {
        ProviderConnection conn = getConnectionAndVerifyTenant(id);
        return ResponseEntity.ok(mapToResponse(conn));
    }

    @PostMapping
    public ResponseEntity<ProviderConnectionResponse> createConnection(@RequestBody ProviderConnectionRequest request) {
        ProviderConnection conn = new ProviderConnection();
        conn.setProviderType(request.getProviderType());
        conn.setProviderName(request.getProviderName());
        conn.setDisplayName(request.getDisplayName());
        conn.setBaseUrl(request.getBaseUrl());
        conn.setAuthenticationType(request.getAuthenticationType());
        conn.setEnabled(request.isEnabled());
        conn.setStatus(ProviderStatus.NOT_CONFIGURED);
        
        if (request.getCapabilities() != null) {
            conn.setCapabilities(request.getCapabilities().stream()
                    .map(ProviderCapability::valueOf)
                    .collect(Collectors.toSet()));
        }

        ProviderConnection saved = connectionRepository.save(conn);

        if (request.getCredentialSecret() != null && !request.getCredentialSecret().isEmpty()) {
            credentialManager.saveCredential(saved.getId(), request.getAuthenticationType(), request.getCredentialSecret());
            ProviderStatus status = providerHealthService.testConnection(saved.getId());
            saved.setStatus(status);
            saved = connectionRepository.save(saved);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProviderConnectionResponse> updateConnection(@PathVariable UUID id, @RequestBody ProviderConnectionRequest request) {
        ProviderConnection conn = getConnectionAndVerifyTenant(id);
        conn.setProviderType(request.getProviderType());
        conn.setProviderName(request.getProviderName());
        conn.setDisplayName(request.getDisplayName());
        conn.setBaseUrl(request.getBaseUrl());
        conn.setAuthenticationType(request.getAuthenticationType());
        conn.setEnabled(request.isEnabled());

        if (request.getCapabilities() != null) {
            conn.setCapabilities(request.getCapabilities().stream()
                    .map(ProviderCapability::valueOf)
                    .collect(Collectors.toSet()));
        }

        ProviderConnection saved = connectionRepository.save(conn);

        if (request.getCredentialSecret() != null && !request.getCredentialSecret().isEmpty()) {
            credentialManager.saveCredential(saved.getId(), request.getAuthenticationType(), request.getCredentialSecret());
            ProviderStatus status = providerHealthService.testConnection(saved.getId());
            saved.setStatus(status);
            saved = connectionRepository.save(saved);
        }

        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable UUID id) {
        ProviderConnection conn = getConnectionAndVerifyTenant(id);
        credentialManager.deleteCredential(id);
        connectionRepository.delete(conn);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, String>> testConnection(@PathVariable UUID id) {
        ProviderStatus status = providerHealthService.testConnection(id);
        ProviderConnection conn = getConnectionAndVerifyTenant(id);
        conn.setStatus(status);
        connectionRepository.save(conn);
        return ResponseEntity.ok(Map.of("status", status.name()));
    }

    @GetMapping("/{id}/discover/{resourceType}")
    public ResponseEntity<List<DiscoveredResource>> discoverResources(
            @PathVariable UUID id,
            @PathVariable ProviderResourceType resourceType) {
        List<DiscoveredResource> resources = providerDiscoveryService.discoverResources(id, resourceType);
        return ResponseEntity.ok(resources);
    }

    private ProviderConnection getConnectionAndVerifyTenant(UUID id) {
        String currentTenant = TenantContext.getCurrentTenant();
        ProviderConnection conn = connectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + id));
        if (currentTenant != null && !currentTenant.equals(conn.getTenantId())) {
            throw new AccessDeniedException("Unauthorized connection access");
        }
        return conn;
    }

    private ProviderConnectionResponse mapToResponse(ProviderConnection conn) {
        ProviderConnectionResponse resp = new ProviderConnectionResponse();
        resp.setId(conn.getId());
        resp.setTenantId(conn.getTenantId());
        resp.setProviderType(conn.getProviderType());
        resp.setProviderName(conn.getProviderName());
        resp.setDisplayName(conn.getDisplayName());
        resp.setBaseUrl(conn.getBaseUrl());
        resp.setAuthenticationType(conn.getAuthenticationType());
        resp.setStatus(conn.getStatus());
        resp.setEnabled(conn.isEnabled());
        resp.setLastSyncAt(conn.getLastSyncAt());
        resp.setLastSuccessfulSyncAt(conn.getLastSuccessfulSyncAt());
        resp.setLastError(conn.getLastError());
        resp.setCreatedAt(conn.getCreatedAt());
        resp.setCredentialConfigured(credentialManager.getCredential(conn.getId()).isPresent());
        
        if (conn.getCapabilities() != null) {
            resp.setCapabilities(conn.getCapabilities().stream()
                    .map(ProviderCapability::name)
                    .collect(Collectors.toList()));
        }
        
        return resp;
    }
}
