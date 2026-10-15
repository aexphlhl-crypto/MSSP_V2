package com.mspportal.backup.provider;

import com.mspportal.integrationcore.provider.BackupProvider;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class MockBackupProvider implements BackupProvider {

    @Override
    public boolean testConnection() {
        return true;
    }

    @Override
    public List<Object> getRepositories() {
        return Arrays.asList(
            Map.of("id", "repo1", "name", "Primary Repo", "capacity", "10TB"),
            Map.of("id", "repo2", "name", "Secondary Repo", "capacity", "5TB")
        );
    }

    @Override
    public List<Object> getJobs() {
        return Arrays.asList(
            Map.of("id", "job1", "name", "Daily Backup", "status", "active"),
            Map.of("id", "job2", "name", "Weekly Archive", "status", "paused")
        );
    }

    @Override
    public List<Object> getExecutions() {
        return Arrays.asList(
            Map.of("id", "exec1", "jobId", "job1", "status", "SUCCESS"),
            Map.of("id", "exec2", "jobId", "job2", "status", "FAILED")
        );
    }

    @Override
    public List<Object> getAlerts() {
        return Arrays.asList(
            Map.of("id", "alert1", "severity", "HIGH", "message", "Storage running out")
        );
    }

    @Override
    public Object getSummary() {
        return Map.of("totalJobs", 2, "activeJobs", 1, "failedExecutions", 1);
    }
}
