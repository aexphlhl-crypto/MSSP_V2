package com.mspportal.ticketing.dto;

import lombok.Data;

@Data
public class SlaSummaryResponse {
    private long totalPolicies;
    private long activePolicies;
    private long breaches;
    private Double averageResponseTimeMinutes;
    private Double averageResolutionTimeMinutes;
}
