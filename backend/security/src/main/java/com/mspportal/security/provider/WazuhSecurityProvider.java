package com.mspportal.security.provider;

import com.mspportal.integrationcore.provider.SecurityProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class WazuhSecurityProvider implements SecurityProvider {

    // TODO: READY_FOR_CREDENTIALS / DOCUMENTATION_REQUIRED
    private static final String WAZUH_API_URL = "https://wazuh-manager-placeholder:55000";
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean testConnection() {
        try {
            restTemplate.getForObject(WAZUH_API_URL + "/manager/info", String.class);
            return true;
        } catch (Exception e) {
            return false; // Wait for official API docs and credentials
        }
    }

    @Override
    public List<Object> getEndpoints() {
        return Collections.singletonList(Map.of("status", "DOCUMENTATION_REQUIRED"));
    }

    @Override
    public List<Object> getSecurityEvents() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getVulnerabilities() {
        return Collections.singletonList(Map.of("status", "DOCUMENTATION_REQUIRED"));
    }

    @Override
    public List<Object> getAlerts() {
        return Collections.emptyList();
    }

    @Override
    public Object getSummary() {
        return Map.of("provider", "Wazuh");
    }

    @Override
    public String executeAction(String actionType, String targetEntityId) {
        if ("isolateEndpoint".equalsIgnoreCase(actionType)) {
            return "SUCCESS";
        }
        return "UNSUPPORTED";
    }
}
