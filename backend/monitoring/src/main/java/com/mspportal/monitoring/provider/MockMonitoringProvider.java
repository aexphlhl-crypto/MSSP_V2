package com.mspportal.monitoring.provider;

import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Mock monitoring provider for local development and integration testing ONLY.
 *
 * <p>This provider returns static fake data and MUST NOT be active in production.
 * It is disabled by default. To enable in a development/test environment, set:
 * {@code monitoring.providers.mock.enabled=true}
 *
 * <p>It is intentionally NOT in any production application.yml profile.
 */
@Component
@ConditionalOnProperty(name = "monitoring.providers.mock.enabled", havingValue = "true", matchIfMissing = false)
public class MockMonitoringProvider implements MonitoringProvider {

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    /**
     * Mock provider declares no real capabilities — it exists only for development scaffolding.
     */
    @Override
    public Set<ProviderCapability> supportedCapabilities() {
        return Collections.emptySet();
    }

    @Override
    public boolean testConnection() {
        return true;
    }

    @Override
    public List<Object> getSites() {
        return Arrays.asList(
            Map.of("id", "site1", "name", "HQ Data Center"),
            Map.of("id", "site2", "name", "Branch Office")
        );
    }

    @Override
    public List<Object> getDevices() {
        return Arrays.asList(
            Map.of("id", "dev1", "name", "Core Switch", "status", "UP"),
            Map.of("id", "dev2", "name", "Edge Router", "status", "DOWN")
        );
    }

    @Override
    public List<Object> getMetrics() {
        return Arrays.asList(
            Map.of("deviceId", "dev1", "cpu", 45.5, "memory", 60.2),
            Map.of("deviceId", "dev2", "cpu", 99.9, "memory", 95.0)
        );
    }

    @Override
    public List<Object> getAlerts() {
        return Arrays.asList(
            Map.of("id", "alert1", "deviceId", "dev2", "severity", "CRITICAL", "message", "Device unreachable")
        );
    }

    @Override
    public Object getSummary() {
        return Map.of("totalDevices", 2, "devicesUp", 1, "devicesDown", 1);
    }
}
