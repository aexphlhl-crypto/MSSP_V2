package com.mspportal.integrationcore.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DataLineageService {

    private final ProviderRawDataRepository providerRawDataRepository;
    private final ObjectMapper objectMapper;

    public Map<String, Object> getLineageByObjectId(String providerObjectId) {
        Optional<ProviderRawData> rawDataOpt = providerRawDataRepository.findFirstByProviderObjectId(providerObjectId);
        
        if (rawDataOpt.isEmpty()) {
            return null;
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
        
        return map;
    }
}
