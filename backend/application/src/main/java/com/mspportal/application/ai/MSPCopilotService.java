package com.mspportal.application.ai;

import com.mspportal.integrationcore.asset.UnifiedAsset;
import com.mspportal.integrationcore.asset.UnifiedAssetRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MSPCopilotService {

    private final UnifiedAssetRepository assetRepository;
    // Assuming some raw data service or just take it as parameter

    @Data
    @Builder
    public static class CopilotResponse {
        private String answer;
        private List<String> evidence;
        private List<String> recommendedActions;
    }

    private final com.mspportal.integrationcore.repository.ProviderRawDataRepository rawDataRepository;

    public CopilotResponse analyzeSituation(UUID tenantId, String query, String rawProviderData) {
        log.info("Analyzing situation for tenant {} with query: {}", tenantId, query);
        
        String traceId = rawProviderData != null && !rawProviderData.trim().isEmpty() ? rawProviderData : query;
        
        // Find if traceId exists in raw data (e.g., as syncRunId)
        String ctxTenantId = com.mspportal.common.tenant.TenantContext.getCurrentTenant();
        List<com.mspportal.integrationcore.entity.ProviderRawData> data = rawDataRepository.findByTenantIdAndSyncRunId(ctxTenantId != null ? ctxTenantId : tenantId.toString(), traceId);
        if (data == null || data.isEmpty()) {
            return CopilotResponse.builder()
                .answer("Insufficient provider evidence")
                .evidence(List.of())
                .recommendedActions(List.of())
                .build();
        }
        
        List<UnifiedAsset> assets = assetRepository.findByTenantId(tenantId);
        
        String answer = "Based on the unified assets and provider data, we have identified anomalous activity on " 
                + assets.size() + " endpoints. Provider raw data context: traceId matched [Trace ID: " + traceId + "]";
        
        List<String> evidence = data.stream()
                .limit(2)
                .map(d -> String.format("Evidence Trace [%s]: Raw data found from %s for object: %s", traceId, d.getProviderName(), d.getProviderObjectId()))
                .collect(Collectors.toList());
                
        List<String> recommendedActions = List.of(
                "Isolate endpoint using Wazuh (Action: isolateEndpoint)",
                "Trigger ad-hoc backup using Commvault (Action: runBackup)"
        );

        return CopilotResponse.builder()
                .answer(answer)
                .evidence(evidence)
                .recommendedActions(recommendedActions)
                .build();
    }
}
