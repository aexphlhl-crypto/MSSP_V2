package com.mspportal.integrationcore.sync;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.entity.ProviderSyncRun;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import com.mspportal.integrationcore.repository.ProviderSyncRunRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public abstract class BaseProviderSyncService {

    protected final ProviderSyncRunRepository syncRunRepository;
    protected final ProviderRawDataRepository rawDataRepository;
    protected final ObjectMapper objectMapper;

    protected BaseProviderSyncService(ProviderSyncRunRepository syncRunRepository,
                                      ProviderRawDataRepository rawDataRepository,
                                      ObjectMapper objectMapper) {
        this.syncRunRepository = syncRunRepository;
        this.rawDataRepository = rawDataRepository;
        this.objectMapper = objectMapper;
    }

    protected ProviderSyncRun startSync(ProviderConnection connection) {
        ProviderSyncRun run = new ProviderSyncRun();
        run.setProviderConnection(connection);
        run.setTenantId(connection.getTenantId());
        run.setStartedAt(Instant.now());
        run.setStatus("RUNNING");
        run.setObjectsFetched(0);
        run.setObjectsCreated(0);
        run.setObjectsUpdated(0);
        run.setObjectsFailed(0);
        return syncRunRepository.save(run);
    }

    protected void completeSync(ProviderSyncRun run, String status, String message) {
        run.setCompletedAt(Instant.now());
        run.setStatus(status);
        run.setErrorMessage(message);
        syncRunRepository.save(run);
    }

    protected String calculateHash(String payload) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            return String.valueOf(payload.hashCode());
        }
    }

    protected void fetchWithPaginationPlaceholder(ProviderConnection connection, ProviderSyncRun run, String endpoint) {
        boolean hasMore = true;
        int page = 0;
        int limit = 50; // default pagination limit
        int maxRetries = 3;
        int timeoutMs = 15000;
        
        while (hasMore) {
            boolean success = false;
            int attempt = 0;
            
            while (!success && attempt < maxRetries) {
                try {
                    // Simulating a paginated API call with RestTemplate and Timeout
                    // String paginatedEndpoint = endpoint + "?offset=" + (page * limit) + "&limit=" + limit;
                    // RestTemplate restTemplate = new RestTemplate(getClientHttpRequestFactory(timeoutMs));
                    // ResponseEntity<List> response = restTemplate.getForEntity(paginatedEndpoint, List.class);
                    // List<Object> items = response.getBody();
                    
                    // Mock processing
                    int itemsFetched = limit; // Assume we fetched `limit` items
                    run.setObjectsFetched(run.getObjectsFetched() != null ? run.getObjectsFetched() + itemsFetched : itemsFetched);
                    
                    success = true;
                    // Mock condition for ending pagination
                    hasMore = page < 2; // stop after 3 pages for this placeholder
                } catch (Exception e) {
                    attempt++;
                    if (attempt >= maxRetries) {
                        completeSync(run, "FAILED", "Failed after " + maxRetries + " attempts: " + e.getMessage());
                        return;
                    }
                    try {
                        long backoff = (long) Math.pow(2, attempt) * 1000;
                        Thread.sleep(backoff);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            }
            page++;
        }
    }
    
    private org.springframework.http.client.ClientHttpRequestFactory getClientHttpRequestFactory(int timeoutMs) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return factory;
    }

    protected void saveRawData(ProviderConnection connection, ProviderSyncRun run, String resourceType, String objectId, Object payloadObj, String endpoint) {
        ProviderRawData rawData = new ProviderRawData();
        rawData.setProviderConnection(connection);
        rawData.setTenantId(connection.getTenantId());
        rawData.setProviderType(connection.getProviderType());
        rawData.setProviderName(connection.getProviderName());
        rawData.setResourceType(resourceType);
        rawData.setProviderObjectId(objectId);
        rawData.setCollectedAt(Instant.now());
        rawData.setEndpoint(endpoint);
        rawData.setSyncRunId(run.getId() != null ? run.getId().toString() : null);
        rawData.setIngestionStatus("PENDING");
        
        try {
            String payloadStr = objectMapper.writeValueAsString(payloadObj);
            rawData.setPayload(payloadStr);
            rawData.setPayloadHash(calculateHash(payloadStr));
            run.setObjectsCreated(run.getObjectsCreated() != null ? run.getObjectsCreated() + 1 : 1);
        } catch (JsonProcessingException e) {
            rawData.setPayload("{\"error\": \"Failed to serialize payload\"}");
            rawData.setPayloadHash("error_hash");
            run.setObjectsFailed(run.getObjectsFailed() != null ? run.getObjectsFailed() + 1 : 1);
        }
        
        rawDataRepository.save(rawData);
    }
}
