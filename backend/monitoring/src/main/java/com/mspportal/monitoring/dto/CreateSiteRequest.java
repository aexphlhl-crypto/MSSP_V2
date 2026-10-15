package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.SiteStatus;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class CreateSiteRequest {
    @NotBlank(message = "Site name is required")
    private String name;
    private String identifier;
    private String description;
    private String address;
    private String city;
    private String country;
    private String timezone;
    private SiteStatus status;
}
