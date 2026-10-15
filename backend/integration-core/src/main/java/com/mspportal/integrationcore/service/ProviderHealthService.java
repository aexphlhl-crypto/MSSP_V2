package com.mspportal.integrationcore.service;

import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.credential.ProviderCredentialManager;
import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.provider.BackupProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Optional;

@Service
public class ProviderHealthService {

    private final ProviderConnectionRepository connectionRepository;
    private final ProviderCredentialManager credentialManager;
    private final ApplicationContext applicationContext;

    public ProviderHealthService(ProviderConnectionRepository connectionRepository, 
                                 ProviderCredentialManager credentialManager,
                                 ApplicationContext applicationContext) {
        this.connectionRepository = connectionRepository;
        this.credentialManager = credentialManager;
        this.applicationContext = applicationContext;
    }

    public ProviderStatus testConnection(UUID providerId) {
        Optional<ProviderConnection> optConn = connectionRepository.findById(providerId);
        if (optConn.isEmpty()) {
            return ProviderStatus.ERROR;
        }

        ProviderConnection conn = optConn.get();
        boolean hasCreds = credentialManager.getCredential(providerId).isPresent();
        
        if (!hasCreds) {
            return ProviderStatus.READY_FOR_CREDENTIALS;
        }

        if (conn.getProviderName() != null && conn.getProviderName().toLowerCase().contains("mock")) {
            return ProviderStatus.CONNECTED;
        }

        // Real Provider bean lookup
        String providerName = conn.getProviderName().toLowerCase();
        String beanName = providerName + 
            (conn.getProviderType() == ProviderType.BACKUP ? "BackupProvider" : 
             conn.getProviderType() == ProviderType.MONITORING ? "MonitoringProvider" : "SecurityProvider");

        if (applicationContext.containsBean(beanName)) {
            Object providerBean = applicationContext.getBean(beanName);
            if (providerBean instanceof BackupProvider bp) {
                boolean ok = bp.testConnection(providerId);
                return ok ? ProviderStatus.CONNECTED : ProviderStatus.CONNECTION_FAILED;
            } else if (providerBean instanceof com.mspportal.integrationcore.provider.MonitoringProvider mp) {
                boolean ok = mp.testConnection(providerId);
                return ok ? ProviderStatus.CONNECTED : ProviderStatus.CONNECTION_FAILED;
            }
        }

        return ProviderStatus.CONNECTION_FAILED;
    }
}
