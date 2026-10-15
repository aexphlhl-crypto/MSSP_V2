package com.mspportal.integrationcore.provider;

import java.util.List;

public interface SecurityProvider {
    boolean testConnection();
    List<Object> getEndpoints();
    List<Object> getSecurityEvents();
    List<Object> getVulnerabilities();
    List<Object> getAlerts();
    Object getSummary();
    
    default String executeAction(String actionType, String targetEntityId) {
        return "UNSUPPORTED";
    }
}
