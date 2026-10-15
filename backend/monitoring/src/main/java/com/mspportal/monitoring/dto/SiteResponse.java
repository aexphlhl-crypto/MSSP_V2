package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.SiteStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SiteResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private String identifier;
    private String description;
    private String address;
    private String city;
    private String country;
    private String timezone;
    private SiteStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    
    private long deviceCount;
    private long onlineDeviceCount;
    private long openAlertCount;
    private long criticalAlertCount;
    private long warningAlertCount;
    private long openTicketCount;
    private java.util.List<ProviderMappingSummary> providerMappings;
}
