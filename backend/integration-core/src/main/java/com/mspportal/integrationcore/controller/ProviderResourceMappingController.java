package com.mspportal.integrationcore.controller;

import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.service.ProviderResourceMappingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/integration/mappings")
public class ProviderResourceMappingController {

    private final ProviderResourceMappingService mappingService;

    public ProviderResourceMappingController(ProviderResourceMappingService mappingService) {
        this.mappingService = mappingService;
    }

    @PostMapping
    public ResponseEntity<ProviderResourceMapping> createMapping(@RequestBody Map<String, Object> payload) {
        UUID providerConnectionId = UUID.fromString((String) payload.get("providerConnectionId"));
        ProviderResourceType resourceType = ProviderResourceType.valueOf((String) payload.get("resourceType"));
        String externalResourceId = (String) payload.get("externalResourceId");
        String externalParentId = (String) payload.get("externalParentId");
        UUID internalResourceId = UUID.fromString((String) payload.get("internalResourceId"));

        ProviderResourceMapping mapping = mappingService.upsert(
                providerConnectionId, resourceType, externalResourceId, externalParentId, internalResourceId);

        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/resource/{type}/{id}")
    public ResponseEntity<List<ProviderResourceMapping>> getMappingsForResource(
            @PathVariable ProviderResourceType type,
            @PathVariable UUID id) {
        return ResponseEntity.ok(mappingService.getMappingsForResource(type, id));
    }
}
