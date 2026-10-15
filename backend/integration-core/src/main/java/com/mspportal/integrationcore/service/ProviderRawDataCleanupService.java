package com.mspportal.integrationcore.service;

import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class ProviderRawDataCleanupService {

    private final ProviderRawDataRepository repository;

    public ProviderRawDataCleanupService(ProviderRawDataRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM every day
    @Transactional
    public void cleanupOldData() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        repository.deleteByCollectedAtBefore(thirtyDaysAgo);
    }
}
