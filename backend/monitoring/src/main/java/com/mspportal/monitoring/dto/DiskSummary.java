package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class DiskSummary {
    private String name;
    private String drive;
    private String type;
    private String model;
    private String serialNumber;
    private Long totalCapacityBytes;
    private Long usedCapacityBytes;
    private Long freeCapacityBytes;
    private Double usagePercentage;
    private String encryptionStatus;
    private String healthStatus;
}
