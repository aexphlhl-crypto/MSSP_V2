package com.mspportal.integrationcore.credential;

import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderCredential;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.repository.ProviderCredentialRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class LocalProviderCredentialManager implements ProviderCredentialManager {

    private final ProviderCredentialRepository credentialRepository;
    private final ProviderConnectionRepository connectionRepository;

    public LocalProviderCredentialManager(ProviderCredentialRepository credentialRepository, ProviderConnectionRepository connectionRepository) {
        this.credentialRepository = credentialRepository;
        this.connectionRepository = connectionRepository;
    }

    @Override
    public Optional<ProviderCredential> getCredential(UUID providerConnectionId) {
        // Use native query to bypass Hibernate @TenantId filter.
        // ProviderConnection is already tenant-scoped, so this lookup is safe.
        // The standard JPA findByProviderConnectionId() adds WHERE tenant_id = ? which
        // may not match the active TenantContext when called from provider clients (e.g. ZabbixClient).
        return credentialRepository.findByProviderConnectionIdNative(providerConnectionId);
    }

    @Override
    public void saveCredential(UUID providerConnectionId, String credentialType, String secretValue) {
        Optional<ProviderConnection> connectionOpt = connectionRepository.findById(providerConnectionId);
        if (connectionOpt.isPresent()) {
            ProviderCredential credential = credentialRepository.findByProviderConnectionId(providerConnectionId)
                    .orElseGet(ProviderCredential::new);
            credential.setProviderConnection(connectionOpt.get());
            credential.setCredentialType(credentialType);
            credential.setSecretValue(secretValue);
            credentialRepository.save(credential);
        }
    }

    @Override
    public void deleteCredential(UUID providerConnectionId) {
        credentialRepository.deleteByProviderConnectionId(providerConnectionId);
    }
}
