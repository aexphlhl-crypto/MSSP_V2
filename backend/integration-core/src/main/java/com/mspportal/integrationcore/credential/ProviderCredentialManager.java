package com.mspportal.integrationcore.credential;

import com.mspportal.integrationcore.entity.ProviderCredential;

import java.util.Optional;
import java.util.UUID;

public interface ProviderCredentialManager {
    Optional<ProviderCredential> getCredential(UUID providerConnectionId);
    void saveCredential(UUID providerConnectionId, String credentialType, String secretValue);
    void deleteCredential(UUID providerConnectionId);
}
