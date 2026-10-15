package com.mspportal.integrationcore.dto;

import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.enums.ProviderType;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ProviderConnectionResponse {
    private UUID id;
    private String tenantId;
    private ProviderType providerType;
    private String providerName;
    private String displayName;
    private String baseUrl;
    private String authenticationType;
    private ProviderStatus status;
    private boolean enabled;
    private Instant lastSyncAt;
    private Instant lastSuccessfulSyncAt;
    private String lastError;
    private List<String> capabilities;
    private boolean credentialConfigured;
    private Instant createdAt;
}
