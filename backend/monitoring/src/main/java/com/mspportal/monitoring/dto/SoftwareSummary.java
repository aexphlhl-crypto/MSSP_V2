package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class SoftwareSummary {
    private String name;
    private String version;
    private String publisher;
    private String installDate;
    private String architecture;
}
