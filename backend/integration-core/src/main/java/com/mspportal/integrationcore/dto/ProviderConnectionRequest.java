package com.mspportal.integrationcore.dto;

import com.mspportal.integrationcore.enums.ProviderType;
import lombok.Data;
import java.util.List;

@Data
public class ProviderConnectionRequest {
    private ProviderType providerType;
    private String providerName;
    private String displayName;
    private String baseUrl;
    private String authenticationType;
    private boolean enabled = true;
    private List<String> capabilities;
    private String credentialSecret;
}
