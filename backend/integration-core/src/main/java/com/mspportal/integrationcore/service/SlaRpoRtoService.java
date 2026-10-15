package com.mspportal.integrationcore.service;

import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SlaRpoRtoService {

    private final ProviderRawDataRepository rawDataRepository;

    public SlaRpoRtoService(ProviderRawDataRepository rawDataRepository) {
        this.rawDataRepository = rawDataRepository;
    }

    public String calculateRpo(String tenantId, ProviderType providerType, String resourceType) {
        List<ProviderRawData> data = rawDataRepository.findByTenantIdAndProviderTypeAndResourceTypeOrderByProviderTimestampDesc(
                tenantId, providerType, resourceType);

        if (data == null || data.isEmpty()) {
            return "NOT_AVAILABLE";
        }

        Optional<ProviderRawData> latest = data.stream()
            .filter(d -> d.getProviderTimestamp() != null)
            .max(Comparator.comparing(ProviderRawData::getProviderTimestamp));

        if (latest.isPresent()) {
            long rpoMinutes = Duration.between(latest.get().getProviderTimestamp(), Instant.now()).toMinutes();
            return rpoMinutes + " minutes";
        }

        return "NOT_AVAILABLE";
    }

    public String calculateRto(String tenantId, ProviderType providerType, String resourceType) {
        return "NOT_AVAILABLE";
    }
}
