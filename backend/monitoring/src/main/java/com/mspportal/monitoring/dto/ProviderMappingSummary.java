package com.mspportal.monitoring.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ProviderMappingSummary {
    private UUID providerConnectionId;
    private String providerName;
    private String providerDisplayName;
    private String providerType;
    private String externalResourceId;
    private String syncStatus;
    private Instant lastSyncedAt;
}
