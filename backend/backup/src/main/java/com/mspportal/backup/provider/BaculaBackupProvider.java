package com.mspportal.backup.provider;

import com.mspportal.integrationcore.provider.BackupProvider;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class BaculaBackupProvider implements BackupProvider {

    @Override
    public boolean testConnection() {
        return true;
    }

    @Override
    public List<Object> getRepositories() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getJobs() {
        return Collections.singletonList(Map.of(
            "mapped", Map.of("name", "Bacula Job 1", "status", "READY_FOR_CREDENTIALS"),
            "raw", "GET /api/v1/jobs HTTP/1.1"
        ));
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
            "provider", "Bacula",
            "status", "READY_FOR_CREDENTIALS",
            "api", "Bacula API"
        );
    }
}
