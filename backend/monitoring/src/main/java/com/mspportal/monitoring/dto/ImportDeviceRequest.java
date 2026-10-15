package com.mspportal.monitoring.dto;

import com.mspportal.integrationcore.dto.DiscoveredResource;
import java.util.List;
import java.util.UUID;

public class ImportDeviceRequest {
    private UUID providerConnectionId;
    private UUID siteId;
    private List<DiscoveredResource> resources;

    public UUID getProviderConnectionId() {
        return providerConnectionId;
    }

    public void setProviderConnectionId(UUID providerConnectionId) {
        this.providerConnectionId = providerConnectionId;
    }

    public UUID getSiteId() {
        return siteId;
    }

    public void setSiteId(UUID siteId) {
        this.siteId = siteId;
    }

    public List<DiscoveredResource> getResources() {
        return resources;
    }

    public void setResources(List<DiscoveredResource> resources) {
        this.resources = resources;
    }
}
