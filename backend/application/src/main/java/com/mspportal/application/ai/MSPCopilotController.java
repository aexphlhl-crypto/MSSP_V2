package com.mspportal.application.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/copilot")
@RequiredArgsConstructor
public class MSPCopilotController {

    private final MSPCopilotService copilotService;

    @GetMapping("/analyze")
    public ResponseEntity<MSPCopilotService.CopilotResponse> analyze(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam String query,
            @RequestParam(required = false) String rawProviderData) {
        
        UUID targetTenantId = tenantId != null ? tenantId : UUID.randomUUID(); // Fallback for tests if not provided
        MSPCopilotService.CopilotResponse response = copilotService.analyzeSituation(targetTenantId, query, rawProviderData);
        
        if (response.getAnswer().contains("Insufficient provider evidence")) {
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.ok(response);
    }
}
