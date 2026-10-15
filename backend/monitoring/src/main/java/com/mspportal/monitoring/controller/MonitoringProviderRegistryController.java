package com.mspportal.monitoring.controller;

import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Exposes the live MonitoringProviderRegistry state to the frontend.
 *
 * <p>The frontend MUST derive its provider capability lists from this endpoint rather than
 * maintaining hardcoded capability maps. This ensures the UI reflects the actual registered
 * provider implementations at runtime.
 *
 * <p>Capability sets returned here are derived from
 * {@link com.mspportal.integrationcore.provider.MonitoringProvider#supportedCapabilities()}
 * on each registered provider bean — never hardcoded.
 */
@RestController
@RequestMapping("/api/v1/monitoring/providers/registry")
@PreAuthorize("@entitlement.has('MONITORING_BASIC')")
public class MonitoringProviderRegistryController {

    private final MonitoringProviderRegistry registry;

    public MonitoringProviderRegistryController(MonitoringProviderRegistry registry) {
        this.registry = registry;
    }

    /**
     * Returns the list of active registered provider names.
     *
     * <p>Only providers whose Spring conditional annotations are satisfied appear here.
     * Mock and stub providers are excluded from production.
     *
     * @return e.g. ["ZABBIX"]
     */
    @GetMapping("/names")
    public Set<String> registeredProviderNames() {
        return registry.registeredProviderNames();
    }

    /**
     * Returns the full provider registry: providerName → list of supported capabilities.
     *
     * <p>Capabilities are declared by each {@link com.mspportal.integrationcore.provider.MonitoringProvider}
     * implementation and derived at runtime. The frontend must use this response to build
     * its capability UI rather than hardcoding provider→capability mappings.
     *
     * @return e.g. {"ZABBIX": ["MONITORING", "DISCOVER_DEVICES", "DEVICE_METRICS", "DEVICE_ALERTS"]}
     */
    @GetMapping("/capabilities")
    public Map<String, List<String>> registeredProviderCapabilities() {
        Map<String, Set<ProviderCapability>> raw = registry.registeredProviderCapabilities();
        Map<String, List<String>> result = new LinkedHashMap<>();
        raw.forEach((name, caps) ->
                result.put(name, caps.stream()
                        .map(ProviderCapability::name)
                        .sorted()
                        .collect(Collectors.toList())));
        return result;
    }
}
