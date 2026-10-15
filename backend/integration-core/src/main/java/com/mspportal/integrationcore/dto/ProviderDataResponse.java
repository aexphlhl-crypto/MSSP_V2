package com.mspportal.integrationcore.dto;

import com.mspportal.integrationcore.enums.ProviderCapability;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProviderDataResponse {
    private String provider;
    private String resourceId;
    private ProviderCapability capability;
    private Instant collectedAt;
    /**
     * Sanitized provider-specific payload (e.g. Map, DTO, or scrubbed JSON).
     * Must never contain raw credentials, tokens, or unrestricted secrets.
     */
    private Object data;
}
