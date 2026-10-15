package com.mspportal.monitoring.mock;

import com.mspportal.monitoring.entity.Device;
import com.mspportal.monitoring.enums.DeviceStatus;
import org.springframework.stereotype.Service;

@Service
public class MockMonitoringService {

    public DeviceStatus calculateMockDeviceStatus(Device device) {
        String hn = device.getHostname() != null ? device.getHostname().toUpperCase() : "";
        if (hn.contains("CRITICAL")) {
            return DeviceStatus.CRITICAL;
        } else if (hn.contains("WARNING")) {
            return DeviceStatus.WARNING;
        } else if (hn.contains("OFFLINE")) {
            return DeviceStatus.OFFLINE;
        } else {
            return DeviceStatus.ONLINE;
        }
    }

    public Double calculateMockCpu(Device device) {
        String hn = device.getHostname() != null ? device.getHostname().toUpperCase() : "";
        if (hn.contains("SERVER")) {
            return hn.contains("CRITICAL") ? 95.0 : 75.0;
        } else if (hn.contains("WORKSTATION")) {
            return 30.0;
        } else {
            return 15.0;
        }
    }

    public Double calculateMockMemory(Device device) {
        String hn = device.getHostname() != null ? device.getHostname().toUpperCase() : "";
        if (hn.contains("SERVER")) {
            return hn.contains("CRITICAL") ? 98.0 : 80.0;
        } else if (hn.contains("WORKSTATION")) {
            return 45.0;
        } else {
            return 25.0;
        }
    }
}
