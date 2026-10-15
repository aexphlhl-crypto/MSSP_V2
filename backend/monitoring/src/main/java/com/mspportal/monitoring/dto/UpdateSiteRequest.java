package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.SiteStatus;
import lombok.Data;

@Data
public class UpdateSiteRequest {
    private String name;
    private String identifier;
    private String description;
    private String address;
    private String city;
    private String country;
    private String timezone;
    private SiteStatus status;
}
