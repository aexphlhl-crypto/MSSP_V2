package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class SecuritySummary {
    private String antivirus;
    private String antivirusStatus;
    private String antivirusDefinitionDate;
    private String firewall;
    private String firewallStatus;
    private String encryption;
    private String encryptionStatus;
    private Boolean secureBoot;
}
