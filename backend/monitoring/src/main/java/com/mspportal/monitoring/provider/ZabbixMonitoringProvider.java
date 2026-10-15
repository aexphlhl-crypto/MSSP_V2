package com.mspportal.monitoring.provider;

import com.mspportal.integrationcore.dto.DiscoveredResource;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.time.Instant;

@Component
public class ZabbixMonitoringProvider implements MonitoringProvider {

    private static final Logger log = LoggerFactory.getLogger(ZabbixMonitoringProvider.class);
    private final ZabbixClient zabbixClient;

    public ZabbixMonitoringProvider(ZabbixClient zabbixClient) {
        this.zabbixClient = zabbixClient;
    }

    @Override
    public String getProviderName() {
        return "ZABBIX";
    }

    /**
     * Declares the monitoring capabilities that this Zabbix integration actually implements.
     * This list is the authoritative source — the frontend must derive its capability UI from
     * MonitoringProviderRegistry rather than maintaining a hardcoded list.
     */
    @Override
    public Set<ProviderCapability> supportedCapabilities() {
        return Set.of(
                ProviderCapability.MONITORING,
                ProviderCapability.DISCOVER_DEVICES,
                ProviderCapability.DISCOVER_ALERTS,
                ProviderCapability.DEVICE_METRICS,
                ProviderCapability.DEVICE_ALERTS
        );
    }

    @Override
    public boolean testConnection() {
        return false;
    }

    @Override
    public boolean testConnection(UUID connectionId) {
        try {
            String token = zabbixClient.authenticate(connectionId);
            return token != null && !token.isEmpty();
        } catch (Exception e) {
            System.err.println("ZABBIX TEST CONNECTION EXCEPTION: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<Object> getSites() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getDevices() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getMetrics() {
        return Collections.emptyList();
    }

    @Override
    public List<Object> getAlerts() {
        return Collections.emptyList();
    }

    @Override
    public Object getSummary() {
        return Map.of(
            "provider", "Zabbix",
            "status", "CONNECTED",
            "api", "JSON-RPC (host.get, trigger.get)"
        );
    }

    @Override
    public List<DiscoveredResource> discoverSites() {
        return Collections.emptyList();
    }

    @Override
    public List<DiscoveredResource> discoverSites(UUID connectionId) {
        return Collections.emptyList();
    }

    @Override
    public List<DiscoveredResource> discoverDevices() {
        return Collections.emptyList();
    }

    @Override
    public List<DiscoveredResource> discoverDevices(UUID connectionId) {
        try {
            List<Map<String, Object>> hosts = zabbixClient.getHosts(connectionId);
            List<DiscoveredResource> resources = new ArrayList<>();
            for (Map<String, Object> host : hosts) {
                String hostId = String.valueOf(host.get("hostid"));
                String name = (String) host.get("name");
                if (name == null || name.isEmpty()) {
                    name = (String) host.get("host");
                }
                
                String ipAddress = null;
                List<Map<String, Object>> interfaces = (List<Map<String, Object>>) host.get("interfaces");
                if (interfaces != null) {
                    for (Map<String, Object> intr : interfaces) {
                        String ip = (String) intr.get("ip");
                        String main = String.valueOf(intr.get("main"));
                        if ("1".equals(main) && ip != null && !ip.isEmpty()) {
                            ipAddress = ip;
                            break;
                        }
                    }
                    if (ipAddress == null && !interfaces.isEmpty()) {
                        ipAddress = (String) interfaces.get(0).get("ip");
                    }
                }
                
                String statusStr = String.valueOf(host.get("status"));
                String availableStr = String.valueOf(host.get("available"));
                String mappedStatus = "UNKNOWN";
                if ("1".equals(statusStr)) {
                    mappedStatus = "OFFLINE";
                } else if ("0".equals(statusStr)) {
                    if ("1".equals(availableStr)) {
                        mappedStatus = "ONLINE";
                    } else if ("2".equals(availableStr)) {
                        mappedStatus = "OFFLINE";
                    } else {
                        mappedStatus = "UNKNOWN";
                    }
                }

                Map<String, Object> rawProps = new HashMap<>();
                if (ipAddress != null) {
                    rawProps.put("ipAddress", ipAddress);
                }
                rawProps.put("status", mappedStatus);

                resources.add(DiscoveredResource.builder()
                        .externalId(hostId)
                        .name(name)
                        .type("SERVER")
                        .rawProperties(rawProps)
                        .build());
            }
            return resources;
        } catch (Exception e) {
            throw new RuntimeException("Zabbix host discovery failed: " + e.getMessage(), e);
        }
    }

    @Override
    public List<DiscoveredResource> discoverAlerts() {
        return Collections.emptyList();
    }

    @Override
    public List<DiscoveredResource> discoverAlerts(UUID connectionId) {
        return Collections.emptyList();
    }

    @Override
    public List<com.mspportal.integrationcore.dto.NormalizedMetric> getMetrics(UUID connectionId, String externalResourceId) {
        try {
            List<Map<String, Object>> items = zabbixClient.getItems(connectionId, externalResourceId);
            List<com.mspportal.integrationcore.dto.NormalizedMetric> list = new ArrayList<>();
            
            Double cpu = findByExactKey(items, "system.cpu.util");
            if (cpu == null) cpu = findMetricValue(items, "cpu utilization", "system.cpu.util", "cpu usage", "cpu load");

            Double mem = findByExactKey(items, "vm.memory.util");
            if (mem == null) mem = findMetricValue(items, "memory utilization", "vm.memory.util", "memory usage", "used memory percentage");

            Double disk = findByExactKey(items, "vfs.fs.dependent.size[/,pused]");  // primary: FS [/] space used %
            if (disk == null) {
                disk = findByExactKey(items, "vfs.fs.size[/,pused]");  // older Zabbix agents
            }
            if (disk == null) {
                disk = findMetricValue(items, "space utilization", "vfs.fs.size", "disk utilization", "disk usage", "percentage of used space");  // fallback keyword scan
            }

            Double netIn = findNetworkMetric(items, "in");
            Double netOut = findNetworkMetric(items, "out");
            Double uptime = findByExactKey(items, "system.uptime");

            log.info("[NORMALIZE] connection={} host={} CPU={}% MEMORY={}% DISK={}% NET_IN={} NET_OUT={} UPTIME={}", 
                connectionId, externalResourceId, cpu, mem, disk, netIn, netOut, uptime);
            
            if (cpu != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("CPU").value(cpu).unit("%").timestamp(Instant.now()).source("ZABBIX").build());
            }
            if (mem != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("Memory").value(mem).unit("%").timestamp(Instant.now()).source("ZABBIX").build());
            }
            if (disk != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("Disk").value(disk).unit("%").timestamp(Instant.now()).source("ZABBIX").build());
            }
            if (netIn != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("NetworkIn").value(netIn).unit("bps").timestamp(Instant.now()).source("ZABBIX").build());
            }
            if (netOut != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("NetworkOut").value(netOut).unit("bps").timestamp(Instant.now()).source("ZABBIX").build());
            }
            if (uptime != null) {
                list.add(com.mspportal.integrationcore.dto.NormalizedMetric.builder()
                        .metricName("Uptime").value(uptime).unit("seconds").timestamp(Instant.now()).source("ZABBIX").build());
            }
            return list;
        } catch (Exception e) {
            log.error("Failed to get metrics for Zabbix connection {} and host {}: {}", connectionId, externalResourceId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<com.mspportal.integrationcore.dto.NormalizedAlert> getAlerts(UUID connectionId, String externalResourceId) {
        try {
            List<Map<String, Object>> problems = zabbixClient.getProblems(connectionId, externalResourceId);
            List<com.mspportal.integrationcore.dto.NormalizedAlert> list = new ArrayList<>();
            for (Map<String, Object> prob : problems) {
                String eventId = String.valueOf(prob.get("eventid"));
                String name = (String) prob.get("name");
                String severityStr = String.valueOf(prob.get("severity"));
                String rEventId = String.valueOf(prob.get("r_eventid"));
                String clockStr = String.valueOf(prob.get("clock"));
                String rClockStr = String.valueOf(prob.get("r_clock"));
                
                String mspSeverity = "INFO";
                if ("4".equals(severityStr) || "5".equals(severityStr)) {
                    mspSeverity = "CRITICAL";
                } else if ("2".equals(severityStr) || "3".equals(severityStr)) {
                    mspSeverity = "WARNING";
                }
                
                String mspStatus = "0".equals(rEventId) ? "OPEN" : "RESOLVED";
                
                Instant occurredAt = clockStr != null ? Instant.ofEpochSecond(Long.parseLong(clockStr)) : Instant.now();
                Instant recoveredAt = (rClockStr != null && !"0".equals(rClockStr) && !rClockStr.isEmpty()) ? Instant.ofEpochSecond(Long.parseLong(rClockStr)) : null;
                
                list.add(com.mspportal.integrationcore.dto.NormalizedAlert.builder()
                        .externalId(eventId)
                        .title(name)
                        .description("Zabbix event ID: " + eventId)
                        .severity(mspSeverity)
                        .status(mspStatus)
                        .occurredAt(occurredAt)
                        .recoveredAt(recoveredAt)
                        .source("ZABBIX")
                        .build());
            }
            return list;
        } catch (Exception e) {
            log.error("Failed to get alerts for Zabbix connection {} and host {}: {}", connectionId, externalResourceId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private Double findMetricValue(List<Map<String, Object>> items, String... keywords) {
        for (Map<String, Object> item : items) {
            String name = (String) item.get("name");
            String key = (String) item.get("key_");
            if (name == null) name = "";
            if (key == null) key = "";
            name = name.toLowerCase();
            key = key.toLowerCase();

            for (String kw : keywords) {
                if (name.contains(kw) || key.contains(kw)) {
                    String lastValueStr = (String) item.get("lastvalue");
                    if (lastValueStr != null && !lastValueStr.isEmpty()) {
                        try {
                            return Double.parseDouble(lastValueStr);
                        } catch (NumberFormatException e) {
                            // ignore
                        }
                    }
                }
            }
        }
        return null;
    }

    private Double findNetworkMetric(List<Map<String, Object>> items, String direction) {
        double total = 0.0;
        boolean found = false;
        String prefix = "net.if." + direction + "[";
        for (Map<String, Object> item : items) {
            String key = (String) item.get("key_");
            if (key != null && key.startsWith(prefix) && !key.contains("dropped") && !key.contains("errors")) {
                String lastValueStr = String.valueOf(item.get("lastvalue"));
                if (lastValueStr != null && !lastValueStr.isEmpty() && !"null".equals(lastValueStr)) {
                    try {
                        total += Double.parseDouble(lastValueStr);
                        found = true;
                    } catch (NumberFormatException e) {
                        org.slf4j.LoggerFactory.getLogger(ZabbixMonitoringProvider.class).warn("[ZabbixProvider] Failed to parse network {}: {}", key, lastValueStr);
                    }
                }
            }
        }
        return found ? total : null;
    }

    private Double findByExactKey(List<Map<String, Object>> items, String exactKey) {
        for (Map<String, Object> item : items) {
            String key = (String) item.get("key_");
            if (exactKey.equals(key)) {
                String lastValueStr = String.valueOf(item.get("lastvalue"));
                if (lastValueStr != null && !lastValueStr.isEmpty() && !"null".equals(lastValueStr)) {
                    try {
                        return Double.parseDouble(lastValueStr);
                    } catch (NumberFormatException e) {
                        org.slf4j.LoggerFactory.getLogger(ZabbixMonitoringProvider.class).warn("[ZabbixProvider] Failed to parse {}: {}", exactKey, lastValueStr);
                    }
                }
            }
        }
        return null;
    }
}
