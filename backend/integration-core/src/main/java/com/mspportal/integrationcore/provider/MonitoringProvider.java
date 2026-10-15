package com.mspportal.integrationcore.provider;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import com.mspportal.integrationcore.dto.DiscoveredResource;
import com.mspportal.integrationcore.dto.NormalizedAlert;
import com.mspportal.integrationcore.dto.NormalizedMetric;
import com.mspportal.integrationcore.enums.ProviderCapability;

/**
 * Core abstraction for all monitoring provider implementations.
 *
 * <p>Each implementation must:
 * <ul>
 *   <li>Return a stable, uppercase identifier from {@link #getProviderName()}.
 *   <li>Declare its supported capabilities via {@link #supportedCapabilities()}.
 *   <li>Contain ALL provider-specific logic internally (API keys, metric key mapping, severity
 *       mapping, auth, etc.). Generic services must never reference provider-specific classes.
 * </ul>
 *
 * <p>The {@link MonitoringProviderRegistry} auto-discovers all {@code @Component} implementations
 * at startup. Adding a new provider requires only: implement this interface + {@code @Component}.
 * Zero changes to generic services are required.
 */
public interface MonitoringProvider {

    /**
     * Returns the stable, uppercase provider identifier used by the registry.
     * Examples: "ZABBIX", "MOTADATA", "PROMETHEUS"
     * This value must NOT change between deployments — it is used as the registry key
     * and stored in {@code ProviderConnection.providerName}.
     */
    String getProviderName();

    /**
     * Returns the set of {@link ProviderCapability} values this provider actually supports.
     * Generic services and the frontend derive their capability lists from this declaration.
     * Providers must NOT return capabilities they do not implement.
     */
    default Set<ProviderCapability> supportedCapabilities() {
        return Collections.emptySet();
    }

    boolean testConnection();

    default boolean testConnection(UUID connectionId) {
        return testConnection();
    }

    List<Object> getSites();
    List<Object> getDevices();
    List<Object> getMetrics();
    List<Object> getAlerts();
    Object getSummary();

    default String executeAction(String actionType, String targetEntityId) {
        return "UNSUPPORTED";
    }

    default List<DiscoveredResource> discoverSites() {
        throw new UnsupportedOperationException("Discovery of Sites is not supported by this provider");
    }

    default List<DiscoveredResource> discoverSites(UUID connectionId) {
        return discoverSites();
    }

    default List<DiscoveredResource> discoverDevices() {
        throw new UnsupportedOperationException("Discovery of Devices is not supported by this provider");
    }

    default List<DiscoveredResource> discoverDevices(UUID connectionId) {
        return discoverDevices();
    }

    default List<DiscoveredResource> discoverAlerts() {
        throw new UnsupportedOperationException("Discovery of Alerts is not supported by this provider");
    }

    default List<DiscoveredResource> discoverAlerts(UUID connectionId) {
        return discoverAlerts();
    }

    /**
     * Returns live normalized metrics for the given device external resource ID.
     * All provider-specific metric key interpretation must happen inside this method.
     * Generic services receive only {@link NormalizedMetric} values with generic names
     * ("CPU", "Memory", "Disk").
     */
    default List<NormalizedMetric> getMetrics(UUID connectionId, String externalResourceId) {
        return Collections.emptyList();
    }

    /**
     * Returns live normalized alerts for the given device external resource ID.
     * All provider-specific severity mapping, status interpretation, and alert normalization
     * must happen inside this method.
     */
    default List<NormalizedAlert> getAlerts(UUID connectionId, String externalResourceId) {
        return Collections.emptyList();
    }

    /**
     * Returns native provider data for the given device and capability.
     * The returned ProviderDataResponse data must be strictly sanitized and free of secrets.
     */
    default com.mspportal.integrationcore.dto.ProviderDataResponse getNativeProviderData(UUID connectionId, String externalResourceId, ProviderCapability capability) {
        throw new UnsupportedOperationException("Native data access not supported for this provider/capability");
    }
}
