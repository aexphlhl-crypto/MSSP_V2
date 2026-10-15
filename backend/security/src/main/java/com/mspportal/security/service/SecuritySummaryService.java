package com.mspportal.security.service;

import com.mspportal.security.dto.SecuritySummaryResponse;
import com.mspportal.security.enums.EndpointProtectionStatus;
import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventStatus;
import com.mspportal.security.enums.VulnerabilitySeverity;
import com.mspportal.security.enums.VulnerabilityStatus;
import com.mspportal.security.repository.SecurityEndpointRepository;
import com.mspportal.security.repository.SecurityEventRepository;
import com.mspportal.security.repository.VulnerabilityRepository;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.dto.ProviderCapabilityContext;
import com.mspportal.security.entity.SecurityEvent;
import com.mspportal.security.entity.SecurityEndpoint;
import com.mspportal.security.dto.SecurityEventResponse;
import com.mspportal.security.dto.SecurityEndpointResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class SecuritySummaryService {

    private final SecurityEventRepository eventRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final SecurityEndpointRepository endpointRepository;
    private final ProviderConnectionRepository providerConnectionRepository;
    private final SecurityServiceHelper helper;

    public SecuritySummaryService(SecurityEventRepository eventRepository, VulnerabilityRepository vulnerabilityRepository, SecurityEndpointRepository endpointRepository, ProviderConnectionRepository providerConnectionRepository, SecurityServiceHelper helper) {
        this.eventRepository = eventRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.endpointRepository = endpointRepository;
        this.providerConnectionRepository = providerConnectionRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public SecuritySummaryResponse getSummary(String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            
            long totalEvents = eventRepository.count();
            long openEvents = eventRepository.findAll().stream().filter(e -> e.getStatus() == SecurityEventStatus.OPEN).count();
            long criticalEvents = eventRepository.findAll().stream().filter(e -> e.getSeverity() == SecurityEventSeverity.CRITICAL).count();
            long highEvents = eventRepository.findAll().stream().filter(e -> e.getSeverity() == SecurityEventSeverity.HIGH).count();

            long totalVulnerabilities = vulnerabilityRepository.count();
            long criticalVulnerabilities = vulnerabilityRepository.findAll().stream().filter(v -> v.getSeverity() == VulnerabilitySeverity.CRITICAL).count();

            long protectedEndpoints = endpointRepository.findAll().stream().filter(e -> e.getProtectionStatus() == EndpointProtectionStatus.PROTECTED).count();
            long vulnerableEndpoints = endpointRepository.findAll().stream().filter(e -> e.getProtectionStatus() == EndpointProtectionStatus.UNPROTECTED).count();
            long warningEndpoints = endpointRepository.findAll().stream().filter(e -> e.getProtectionStatus() == EndpointProtectionStatus.WARNING).count();
            long unknownEndpoints = endpointRepository.findAll().stream().filter(e -> e.getProtectionStatus() == EndpointProtectionStatus.UNKNOWN).count();
            
            long mediumVulnerabilities = vulnerabilityRepository.findAll().stream().filter(v -> v.getSeverity() == VulnerabilitySeverity.MEDIUM).count();
            long lowVulnerabilities = vulnerabilityRepository.findAll().stream().filter(v -> v.getSeverity() == VulnerabilitySeverity.LOW).count();

            List<ProviderConnection> activeProviders = providerConnectionRepository.findAll().stream()
                .filter(p -> p.getTenantId().equals(requestedTenantId) && p.getStatus() == ProviderStatus.CONNECTED)
                .collect(Collectors.toList());

            Map<ProviderCapability, List<String>> capMap = new java.util.HashMap<>();
            for (ProviderConnection p : activeProviders) {
                for (ProviderCapability c : p.getCapabilities()) {
                    capMap.computeIfAbsent(c, k -> new ArrayList<>()).add(p.getDisplayName() != null ? p.getDisplayName() : p.getProviderName());
                }
            }
            List<ProviderCapabilityContext> capabilities = capMap.entrySet().stream()
                .map(e -> new ProviderCapabilityContext(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

            List<SecurityEventResponse> recentEvents = eventRepository.findAll().stream()
                .sorted(Comparator.comparing(SecurityEvent::getCreatedAt).reversed())
                .limit(10)
                .map(this::mapEvent)
                .collect(Collectors.toList());

            List<SecurityEndpointResponse> recentEndpoints = endpointRepository.findAll().stream()
                .sorted(Comparator.comparing((SecurityEndpoint e) -> e.getRiskScore() != null ? e.getRiskScore() : 0).reversed()
                      .thenComparing(Comparator.comparing(SecurityEndpoint::getLastCheckAt).reversed()))
                .limit(10)
                .map(this::mapEndpoint)
                .collect(Collectors.toList());

            SecuritySummaryResponse res = new SecuritySummaryResponse();
            res.setTotalEvents(totalEvents);
            res.setOpenEvents(openEvents);
            res.setCriticalEvents(criticalEvents);
            res.setHighEvents(highEvents);
            res.setTotalVulnerabilities(totalVulnerabilities);
            res.setCriticalVulnerabilities(criticalVulnerabilities);
            res.setMediumVulnerabilities(mediumVulnerabilities);
            res.setLowVulnerabilities(lowVulnerabilities);
            res.setProtectedEndpoints(protectedEndpoints);
            res.setVulnerableEndpoints(vulnerableEndpoints);
            res.setWarningEndpoints(warningEndpoints);
            res.setUnknownEndpoints(unknownEndpoints);
            res.setAvailableCapabilities(capabilities);
            res.setRecentEvents(recentEvents);
            res.setRecentEndpoints(recentEndpoints);

            return res;
        });
    }

    private SecurityEventResponse mapEvent(SecurityEvent e) {
        SecurityEventResponse r = new SecurityEventResponse();
        r.setId(e.getId());
        r.setTenantId(e.getTenantId());
        r.setEndpointId(e.getEndpointId());
        r.setType(e.getType());
        r.setSeverity(e.getSeverity());
        r.setStatus(e.getStatus());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setSource(e.getSource());
        r.setDetectedAt(e.getDetectedAt());
        r.setResolvedAt(e.getResolvedAt());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    private SecurityEndpointResponse mapEndpoint(SecurityEndpoint e) {
        SecurityEndpointResponse r = new SecurityEndpointResponse();
        r.setId(e.getId());
        r.setTenantId(e.getTenantId());
        r.setDeviceId(e.getDeviceId());
        r.setHostname(e.getHostname());
        r.setIpAddress(e.getIpAddress());
        r.setProtectionStatus(e.getProtectionStatus());
        r.setAgentVersion(e.getAgentVersion());
        r.setLastCheckAt(e.getLastCheckAt());
        r.setRiskScore(e.getRiskScore());
        r.setIsolationSupported(e.isIsolationSupported());
        return r;
    }
}
