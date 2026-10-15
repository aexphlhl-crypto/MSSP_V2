package com.mspportal.security.dto;

import lombok.Data;
import java.util.List;
import com.mspportal.integrationcore.dto.ProviderCapabilityContext;

@Data
public class SecuritySummaryResponse {
    private long totalEvents;
    private long criticalEvents;
    private long highEvents;
    private long openEvents;
    private long totalVulnerabilities;
    private long criticalVulnerabilities;
    private long vulnerableEndpoints;
    private long protectedEndpoints;
    private long warningEndpoints;
    private long unknownEndpoints;
    private long mediumVulnerabilities;
    private long lowVulnerabilities;
    
    private List<ProviderCapabilityContext> availableCapabilities;
    private List<SecurityEventResponse> recentEvents;
    private List<SecurityEndpointResponse> recentEndpoints;
}
