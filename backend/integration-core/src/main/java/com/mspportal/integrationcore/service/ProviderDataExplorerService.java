package com.mspportal.integrationcore.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProviderDataExplorerService {

    private final ProviderRawDataRepository providerRawDataRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<Map<String, Object>> getProviderData(UUID providerId, Pageable pageable) {
        Page<ProviderRawData> rawDataPage = providerRawDataRepository.findByProviderConnectionId(providerId, pageable);
        
        return rawDataPage.map(data -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", data.getId());
            map.put("resourceType", data.getResourceType());
            map.put("providerObjectId", data.getProviderObjectId());
            map.put("collectedAt", data.getCollectedAt());
            map.put("lastSeenAt", data.getLastSeenAt());
            map.put("lastSyncedAt", data.getLastSyncedAt());
            map.put("providerTimestamp", data.getProviderTimestamp());
            map.put("dataFreshness", data.getDataFreshness());
            map.put("syncStatus", data.getSyncStatus());
            map.put("ingestionStatus", data.getIngestionStatus());
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
        });
    }
}
