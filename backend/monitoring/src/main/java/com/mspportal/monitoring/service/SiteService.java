package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.service.ProviderResourceMappingService;
import com.mspportal.monitoring.dto.CreateSiteRequest;
import com.mspportal.monitoring.dto.ProviderMappingSummary;
import com.mspportal.monitoring.dto.SiteResponse;
import com.mspportal.monitoring.dto.UpdateSiteRequest;
import com.mspportal.monitoring.entity.Site;
import com.mspportal.monitoring.enums.DeviceStatus;
import com.mspportal.monitoring.enums.AlertStatus;
import com.mspportal.monitoring.repository.AlertRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.monitoring.repository.SiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final ProviderResourceMappingService providerResourceMappingService;
    private final MonitoringServiceHelper helper;

    public SiteService(SiteRepository siteRepository, 
                       DeviceRepository deviceRepository,
                       AlertRepository alertRepository,
                       ProviderResourceMappingService providerResourceMappingService,
                       MonitoringServiceHelper helper) {
        this.siteRepository = siteRepository;
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
        this.providerResourceMappingService = providerResourceMappingService;
        this.helper = helper;
    }

    @Transactional
    public SiteResponse createSite(CreateSiteRequest request, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Site site = new Site();
            site.setName(request.getName());
            site.setIdentifier(request.getIdentifier());
            site.setDescription(request.getDescription());
            site.setAddress(request.getAddress());
            site.setCity(request.getCity());
            site.setCountry(request.getCountry());
            site.setTimezone(request.getTimezone());
            site.setStatus(request.getStatus());

            Site saved = siteRepository.save(site);
            return mapToResponse(saved);
        });
    }

    @Transactional(readOnly = true)
    public List<SiteResponse> listSites(String requestedTenantId, String statusFilter) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            List<Site> sites;
            if (statusFilter != null && !statusFilter.isEmpty()) {
                sites = siteRepository.findAll().stream()
                        .filter(s -> s.getStatus() != null && s.getStatus().name().equalsIgnoreCase(statusFilter))
                        .collect(Collectors.toList());
            } else {
                sites = siteRepository.findAll();
            }
            return sites.stream().map(this::mapToResponse).collect(Collectors.toList());
        });
    }

    @Transactional(readOnly = true)
    public SiteResponse getSite(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Site site = siteRepository.findById(id).orElseThrow(() -> new RuntimeException("Site not found"));
            return mapToResponse(site);
        });
    }

    @Transactional
    public SiteResponse updateSite(UUID id, UpdateSiteRequest request, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Site site = siteRepository.findById(id).orElseThrow(() -> new RuntimeException("Site not found"));
            if (request.getName() != null) site.setName(request.getName());
            if (request.getIdentifier() != null) site.setIdentifier(request.getIdentifier());
            if (request.getDescription() != null) site.setDescription(request.getDescription());
            if (request.getAddress() != null) site.setAddress(request.getAddress());
            if (request.getCity() != null) site.setCity(request.getCity());
            if (request.getCountry() != null) site.setCountry(request.getCountry());
            if (request.getTimezone() != null) site.setTimezone(request.getTimezone());
            if (request.getStatus() != null) site.setStatus(request.getStatus());

            Site saved = siteRepository.save(site);
            return mapToResponse(saved);
        });
    }

    @Transactional
    public void deleteSite(UUID id, String requestedTenantId) {
        helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Site site = siteRepository.findById(id).orElseThrow(() -> new RuntimeException("Site not found"));
            siteRepository.delete(site);
            return null;
        });
    }

    private SiteResponse mapToResponse(Site s) {
        SiteResponse r = new SiteResponse();
        r.setId(s.getId());
        r.setTenantId(s.getTenantId());
        r.setName(s.getName());
        r.setIdentifier(s.getIdentifier());
        r.setDescription(s.getDescription());
        r.setAddress(s.getAddress());
        r.setCity(s.getCity());
        r.setCountry(s.getCountry());
        r.setTimezone(s.getTimezone());
        r.setStatus(s.getStatus());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());

        // Fill dynamic metrics
        r.setDeviceCount(deviceRepository.countBySiteId(s.getId()));
        r.setOnlineDeviceCount(deviceRepository.countBySiteIdAndStatus(s.getId(), DeviceStatus.ONLINE));

        List<UUID> deviceIds = deviceRepository.findIdsBySiteId(s.getId());
        if (!deviceIds.isEmpty()) {
            r.setOpenAlertCount(alertRepository.countByDeviceIdInAndStatus(deviceIds, AlertStatus.OPEN));
            r.setCriticalAlertCount(alertRepository.countByDeviceIdInAndStatusAndSeverity(deviceIds, AlertStatus.OPEN, com.mspportal.monitoring.enums.AlertSeverity.CRITICAL));
            r.setWarningAlertCount(alertRepository.countByDeviceIdInAndStatusAndSeverity(deviceIds, AlertStatus.OPEN, com.mspportal.monitoring.enums.AlertSeverity.WARNING));
        } else {
            r.setOpenAlertCount(0);
            r.setCriticalAlertCount(0);
            r.setWarningAlertCount(0);
        }

        // Fill provider mappings
        List<ProviderResourceMapping> mappings = providerResourceMappingService.getMappingsForResource(ProviderResourceType.SITE, s.getId());
        r.setProviderMappings(mappings.stream().map(m -> {
            ProviderMappingSummary pms = new ProviderMappingSummary();
            pms.setProviderConnectionId(m.getProviderConnection().getId());
            pms.setProviderName(m.getProviderConnection().getProviderName());
            // providerDisplayName might not exist on ProviderConnection, fallback to name
            pms.setProviderDisplayName(m.getProviderConnection().getProviderName());
            pms.setProviderType(m.getProviderConnection().getProviderType().name());
            pms.setExternalResourceId(m.getExternalResourceId());
            pms.setSyncStatus(m.getSyncStatus().name());
            pms.setLastSyncedAt(m.getLastSyncedAt());
            return pms;
        }).collect(Collectors.toList()));

        return r;
    }
}
