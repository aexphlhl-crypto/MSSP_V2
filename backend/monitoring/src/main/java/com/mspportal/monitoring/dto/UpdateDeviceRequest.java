package com.mspportal.monitoring.dto;

import com.mspportal.monitoring.enums.DeviceStatus;
import com.mspportal.monitoring.enums.DeviceType;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateDeviceRequest {
    private UUID siteId;
    private String hostname;
    private String displayName;
    private String ipAddress;
    private DeviceType deviceType;
    private String operatingSystem;
    private DeviceStatus status;
    private boolean monitoringEnabled;
}
