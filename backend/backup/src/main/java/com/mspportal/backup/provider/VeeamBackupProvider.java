package com.mspportal.backup.provider;

import com.mspportal.integrationcore.provider.BackupProvider;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class VeeamBackupProvider implements BackupProvider {

    @Override
    public boolean testConnection() {
        return true;
    }

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
    private static final String VEEAM_API_URL = "https://veeam-placeholder/api";

    @Override
    public List<Object> getRepositories() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getJobs() {
        return Collections.singletonList(Map.of("status", "DOCUMENTATION_REQUIRED"));
    }

    @Override
    public List<Object> getExecutions() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getAlerts() {
        return Collections.emptyList();
    }

    @Override
    public Object getSummary() {
        return Map.of(
            "provider", "Veeam",
            "status", "READY_FOR_CREDENTIALS",
            "api", "Enterprise Manager REST API"
        );
    }
}
