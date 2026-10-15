package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class OsSummary {
    private String name;
    private String edition;
    private String version;
    private String build;
    private String architecture;
    private String installDate;
    private String licenseStatus;
}
