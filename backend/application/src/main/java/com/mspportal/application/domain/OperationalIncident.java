package com.mspportal.application.domain;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class OperationalIncident {
    private UUID incidentId;
    private String tenantId;
    private String providerName; 
    private String providerObjectId; 
    private String status;
    private LocalDateTime createdAt;
    
    private List<String> sourceEventIds = new ArrayList<>();
    
    private String correlationExplanation;
    private List<String> recommendedActions = new ArrayList<>();
    private String rootCauseHypothesis;
}
