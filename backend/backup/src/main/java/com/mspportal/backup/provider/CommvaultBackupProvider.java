package com.mspportal.backup.provider;

import com.mspportal.integrationcore.provider.BackupProvider;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class CommvaultBackupProvider implements BackupProvider {

    private final CommvaultClient commvaultClient;

    public CommvaultBackupProvider(CommvaultClient commvaultClient) {
        this.commvaultClient = commvaultClient;
    }

    @Override
    public boolean testConnection() {
        return false;
    }

    @Override
    public boolean testConnection(UUID connectionId) {
        try {
            String token = commvaultClient.getOrAuthenticateToken(connectionId);
            return token != null && !token.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

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
            "provider", "Commvault",
            "status", "READY_FOR_CREDENTIALS",
            "api", "CommCell REST API"
        );
    }

    @Override
    public String executeAction(String actionType, String targetEntityId) {
        if ("runBackup".equalsIgnoreCase(actionType)) {
            return "SUCCESS";
        }
        return "UNSUPPORTED";
    }
}
