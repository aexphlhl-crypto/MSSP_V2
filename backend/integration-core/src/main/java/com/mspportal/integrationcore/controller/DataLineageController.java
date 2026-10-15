package com.mspportal.integrationcore.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/integration/data-lineage")
@RequiredArgsConstructor
public class DataLineageController {

    private final ProviderRawDataRepository providerRawDataRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/object/{providerObjectId}")
    public ResponseEntity<Map<String, Object>> getLineageByObjectId(@PathVariable String providerObjectId) {
        String tenantId = com.mspportal.common.tenant.TenantContext.getCurrentTenant();
        Optional<ProviderRawData> rawDataOpt = tenantId != null ? 
            providerRawDataRepository.findFirstByTenantIdAndProviderObjectId(tenantId, providerObjectId) :
            providerRawDataRepository.findFirstByProviderObjectId(providerObjectId);
        
        if (rawDataOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProviderRawData data = rawDataOpt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", data.getId());
        map.put("providerType", data.getProviderType());
        map.put("providerName", data.getProviderName());
        map.put("resourceType", data.getResourceType());
        map.put("providerObjectId", data.getProviderObjectId());
        map.put("collectedAt", data.getCollectedAt());
        map.put("payloadHash", data.getPayloadHash());
        map.put("syncRunId", data.getSyncRunId());

        try {
            if (data.getPayload() != null) {
                map.put("payload", objectMapper.readValue(data.getPayload(), new TypeReference<Map<String, Object>>() {}));
            } else {
                map.put("payload", null);
            }
        } catch (JsonProcessingException e) {
            map.put("payload", data.getPayload()); // fallback to string
        }
        
        return ResponseEntity.ok(map);
    }
}
