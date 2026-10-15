package com.mspportal.monitoring.dto;

import lombok.Data;
import java.util.List;

@Data
public class NetworkSummary {
    private String privateIp;
    private String publicIp;
    private List<String> macAddresses;
    private String domain;
    private String workgroup;
    private List<String> dnsServers;
}
