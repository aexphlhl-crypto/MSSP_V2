package com.mspportal.integrationcore.provider;

import com.mspportal.integrationcore.enums.ProviderCapability;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Registry of all {@link MonitoringProvider} implementations registered as Spring beans.
 *
 * <p>Providers are indexed by their stable identifier returned by
 * {@link MonitoringProvider#getProviderName()}. Generic services (DeviceService, MetricService,
 * etc.) depend only on this registry and the {@link MonitoringProvider} interface — never on
 * provider-specific classes, bean names, or ApplicationContext.
 *
 * <p><strong>Adding a new provider:</strong> implement {@link MonitoringProvider}, annotate with
 * {@code @Component} (or appropriate conditional), and return a unique uppercase identifier from
 * {@code getProviderName()}. No changes to this registry or any generic service are required.
 *
 * <p><strong>Provider isolation:</strong> only providers that are Spring beans (i.e. their
 * conditional annotations are satisfied) will be registered at startup. Mock and stub providers
 * must use {@code @ConditionalOnProperty} to prevent production registration.
 */
@Component
public class MonitoringProviderRegistry {

    private final Map<String, MonitoringProvider> providerMap;

    /**
     * Spring injects all active {@link MonitoringProvider} beans automatically.
     * Providers gated by {@code @ConditionalOnProperty} or {@code @Profile} will only appear
     * here if their condition is satisfied.
     */
    public MonitoringProviderRegistry(List<MonitoringProvider> providers) {
        this.providerMap = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        Function.identity()
                ));
    }

    /**
     * Resolve a provider by its stable name (case-insensitive).
     *
     * @param providerName the provider name stored in {@code ProviderConnection.providerName}
     * @return Optional containing the provider, or empty if not registered
     */
    public Optional<MonitoringProvider> resolve(String providerName) {
        if (providerName == null) return Optional.empty();
        return Optional.ofNullable(providerMap.get(providerName.toUpperCase()));
    }

    /**
     * Resolve a provider by its stable name, throwing {@link ProviderNotRegisteredException}
     * if the provider is not registered.
     *
     * <p>Use this in write/sync paths where an unknown provider indicates a configuration error
     * that must not silently succeed.
     *
     * @param providerName the provider name stored in {@code ProviderConnection.providerName}
     * @return the registered {@link MonitoringProvider}
     * @throws ProviderNotRegisteredException if no provider is registered for this name
     */
    public MonitoringProvider resolveOrThrow(String providerName) {
        return resolve(providerName)
                .orElseThrow(() -> new ProviderNotRegisteredException(
                        providerName != null ? providerName : "<null>"));
    }

    /**
     * Returns the names of all currently registered providers.
     * Derived from actual registered beans — never hardcoded.
     */
    public Set<String> registeredProviderNames() {
        return Collections.unmodifiableSet(providerMap.keySet());
    }

    /**
     * Returns a map of providerName -> Set of supported capabilities.
     * Derived from actual registered provider implementations via
     * {@link MonitoringProvider#supportedCapabilities()}.
     *
     * <p>This is the authoritative source for capability lists exposed to the frontend.
     * Frontends must NOT hardcode provider capabilities.
     */
    public Map<String, Set<ProviderCapability>> registeredProviderCapabilities() {
        Map<String, Set<ProviderCapability>> result = new LinkedHashMap<>();
        providerMap.forEach((name, provider) ->
                result.put(name, Collections.unmodifiableSet(provider.supportedCapabilities())));
        return Collections.unmodifiableMap(result);
    }
}
