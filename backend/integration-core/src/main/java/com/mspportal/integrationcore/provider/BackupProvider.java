package com.mspportal.integrationcore.provider;

import java.util.List;
import java.util.UUID;

public interface BackupProvider {
    boolean testConnection();
    
    default boolean testConnection(UUID connectionId) {
        return testConnection();
    }
    
    List<Object> getRepositories();
    List<Object> getJobs();
    List<Object> getExecutions();
    List<Object> getAlerts();
    Object getSummary();
    
    default String executeAction(String actionType, String targetEntityId) {
        return "UNSUPPORTED";
    }
}
