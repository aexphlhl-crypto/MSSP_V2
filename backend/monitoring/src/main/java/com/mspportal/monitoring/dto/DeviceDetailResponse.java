package com.mspportal.monitoring.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
public class DeviceDetailResponse extends DeviceResponse {
    /** Public IP address if exposed by provider (private IP is in parent ipAddress field) */
    private String publicIp;
    /** Hardware inventory — only populated when provider exposes DEVICE_HARDWARE capability */
    private HardwareSummary hardware;
    /** Network details — only populated when provider exposes DEVICE_NETWORK capability */
    private NetworkSummary network;
    /** Operating system summary — only populated when provider exposes DEVICE_OS capability */
    private OsSummary os;
    /** Security posture — only populated when provider exposes DEVICE_SECURITY capability */
    private SecuritySummary security;
    /** Disk list — only populated when provider exposes DEVICE_DISKS capability */
    private List<DiskSummary> disks;
    /** Software inventory — only populated when provider exposes DEVICE_SOFTWARE capability */
    private List<SoftwareSummary> software;
    /** Activity timeline — built from provider sync events, mapping creation, etc. */
    private List<ActivityEvent> activityEvents;
    /** Set of capability names actually supported for this device (from connected providers) */
    private Set<String> capabilities;
}
