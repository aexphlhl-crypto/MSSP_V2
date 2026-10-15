package com.mspportal.security.provider;

import com.mspportal.integrationcore.provider.SecurityProvider;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class MockSecurityProvider implements SecurityProvider {

    @Override
    public boolean testConnection() {
        return true;
    }

    @Override
    public List<Object> getEndpoints() {
        return Arrays.asList(
            Map.of("id", "ep1", "hostname", "workstation-01", "os", "Windows 10"),
            Map.of("id", "ep2", "hostname", "server-01", "os", "Ubuntu 22.04")
        );
    }

    @Override
    public List<Object> getSecurityEvents() {
        return Arrays.asList(
            Map.of("id", "evt1", "type", "LOGIN_FAILED", "sourceIp", "192.168.1.100"),
            Map.of("id", "evt2", "type", "MALWARE_DETECTED", "sourceIp", "10.0.0.5")
        );
    }

    @Override
    public List<Object> getVulnerabilities() {
        return Arrays.asList(
            Map.of("cve", "CVE-2021-44228", "severity", "CRITICAL", "description", "Log4Shell")
        );
    }

    @Override
    public List<Object> getAlerts() {
        return Arrays.asList(
            Map.of("id", "alert1", "severity", "HIGH", "message", "Multiple failed logins detected")
        );
    }

    @Override
    public Object getSummary() {
        return Map.of("activeEndpoints", 2, "criticalVulnerabilities", 1, "openAlerts", 1);
    }
}
