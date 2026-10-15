package com.mspportal.integrationcore.provider;

/**
 * Thrown when a MonitoringProvider with the requested name is not registered in the
 * {@link MonitoringProviderRegistry}.
 *
 * <p>Generic services must use {@link MonitoringProviderRegistry#resolveOrThrow(String)} to get
 * an explicit failure instead of silently returning empty metrics/alerts for unknown providers.
 */
public class ProviderNotRegisteredException extends RuntimeException {

    private final String providerName;

    public ProviderNotRegisteredException(String providerName) {
        super("No MonitoringProvider registered for name: '" + providerName + "'. "
                + "Ensure a @Component implementing MonitoringProvider returns this name from getProviderName().");
        this.providerName = providerName;
    }

    public String getProviderName() {
        return providerName;
    }
}
