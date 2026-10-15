package com.mspportal.monitoring.dto;

import lombok.Data;

@Data
public class HardwareSummary {
    private String manufacturer;
    private String model;
    private String serialNumber;
    private String processor;
    private Integer processorCores;
    private Long memoryTotalBytes;
    private String motherboard;
    private String biosManufacturer;
    private String biosVersion;
    private String biosDate;
    private String gpuVendor;
    private String gpuModel;
}
