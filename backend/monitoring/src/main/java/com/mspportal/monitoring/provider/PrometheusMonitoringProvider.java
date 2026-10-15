package com.mspportal.monitoring.provider;

import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Prometheus monitoring provider stub — NOT YET IMPLEMENTED.
 *
 * <p>This class is a placeholder for a future Prometheus integration.
 * It is disabled by default and MUST NOT be active in production until a complete
 * implementation is delivered (including real PromQL queries, connection credentials,
 * metric key normalization, and alert rule mapping).
 *
 * <p>To enable in a non-production environment for development scaffolding, set:
 * {@code monitoring.providers.prometheus.enabled=true}
 *
 * <p>When implementing, override:
 * <ul>
 *   <li>{@link #testConnection(java.util.UUID)} — authenticate against Prometheus HTTP API
 *   <li>{@link #getMetrics(java.util.UUID, String)} — query {@code /api/v1/query} and normalize
 *   <li>{@link #getAlerts(java.util.UUID, String)} — query {@code /api/v1/alerts} and normalize
 *   <li>{@link #discoverDevices(java.util.UUID)} — derive devices from label sets
 *   <li>{@link #supportedCapabilities()} — declare actual implemented capabilities
 * </ul>
 */
@Component
@ConditionalOnProperty(name = "monitoring.providers.prometheus.enabled", havingValue = "true", matchIfMissing = false)
public class PrometheusMonitoringProvider implements MonitoringProvider {

    @Override
    public String getProviderName() {
        return "PROMETHEUS";
    }

    /**
     * Returns empty — Prometheus integration is not yet implemented.
     * Update this method when real capabilities are available.
     */
    @Override
    public Set<ProviderCapability> supportedCapabilities() {
        return Collections.emptySet();
    }

    @Override
    public boolean testConnection() {
        return false;
    }

    @Override
    public List<Object> getSites() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getDevices() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getMetrics() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getAlerts() {
        return Collections.emptyList();
    }

    @Override
    public Object getSummary() {
        return Map.of(
            "provider", "Prometheus",
            "status", "NOT_IMPLEMENTED",
            "note", "Implementation pending. Set monitoring.providers.prometheus.enabled=true only in dev."
        );
    }
}
