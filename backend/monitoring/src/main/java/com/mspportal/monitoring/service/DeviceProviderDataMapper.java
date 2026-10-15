package com.mspportal.monitoring.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.monitoring.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Extracts structured device operational data from ProviderRawData payloads.
 *
 * Each provider may return different JSON structures. This mapper normalizes them
 * into the common DeviceDetailResponse DTOs without assuming a fixed provider schema.
 *
 * IMPORTANT: Only populates fields that are actually present in the payload.
 * Never fabricates data. If a JSON key is absent, the corresponding DTO field remains null.
 */
@Component
public class DeviceProviderDataMapper {

    private static final Logger log = LoggerFactory.getLogger(DeviceProviderDataMapper.class);
    private final ObjectMapper objectMapper;

    public DeviceProviderDataMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Enrich a DeviceDetailResponse with data extracted from a ProviderRawData payload.
     * The connection's declared capabilities are added to capabilitySet.
     * Additional capabilities may be inferred from the payload content.
     *
     * @param response          the response object to enrich (modified in-place)
     * @param rawData           the raw provider data record
     * @param connectionCaps    capabilities declared for this provider connection
     * @param capabilitySet     accumulator for discovered capabilities
     */
    public void enrich(DeviceDetailResponse response, ProviderRawData rawData,
                       Set<ProviderCapability> connectionCaps, Set<String> capabilitySet) {
        if (rawData == null || rawData.getPayload() == null) return;

        // Add declared connection capabilities
        for (ProviderCapability cap : connectionCaps) {
            capabilitySet.add(cap.name());
        }

        try {
            JsonNode root = objectMapper.readTree(rawData.getPayload());

            enrichHardware(response, root, capabilitySet);
            enrichNetwork(response, root, capabilitySet);
            enrichOs(response, root, capabilitySet);
            enrichSecurity(response, root, capabilitySet);
            enrichDisks(response, root, capabilitySet);
            enrichSoftware(response, root, capabilitySet);

        } catch (Exception e) {
            log.warn("Failed to parse ProviderRawData payload for device enrichment: {}", e.getMessage());
        }
    }

    // ── Hardware ──────────────────────────────────────────────────────────────

    private void enrichHardware(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getHardware() != null) return; // Don't overwrite if already set

        JsonNode hw = getFirstPresent(root, "hardware", "system");
        if (hw == null) return;

        HardwareSummary hardware = new HardwareSummary();
        hardware.setManufacturer(text(hw, "manufacturer"));
        hardware.setModel(text(hw, "model"));
        hardware.setSerialNumber(text(hw, "serialNumber"));
        hardware.setProcessor(text(hw, "processor"));
        if (hardware.getProcessor() == null) hardware.setProcessor(root.has("cpu") ? text(root.get("cpu"), "model") : null);
        hardware.setProcessorCores(intVal(hw, "processorCores"));
        hardware.setMemoryTotalBytes(longVal(hw, "memoryTotalBytes"));
        hardware.setMotherboard(text(hw, "motherboard"));

        JsonNode bios = hw.get("bios");
        if (bios == null) bios = root.get("bios");
        if (bios != null) {
            hardware.setBiosManufacturer(text(bios, "manufacturer"));
            hardware.setBiosVersion(text(bios, "version"));
            hardware.setBiosDate(text(bios, "date"));
        } else {
            hardware.setBiosManufacturer(text(hw, "biosManufacturer"));
            hardware.setBiosVersion(text(hw, "biosVersion"));
            hardware.setBiosDate(text(hw, "biosDate"));
        }

        JsonNode gpu = hw.get("gpu");
        if (gpu != null) {
            hardware.setGpuVendor(text(gpu, "vendor"));
            hardware.setGpuModel(text(gpu, "model"));
        }

        if (hasAnyNonNullField(hardware)) {
            response.setHardware(hardware);
            caps.add(ProviderCapability.DEVICE_HARDWARE.name());
        }
    }

    // ── Network ───────────────────────────────────────────────────────────────

    private void enrichNetwork(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getNetwork() != null) return;

        NetworkSummary network = new NetworkSummary();

        // Try nested "network" object first, then flat root fields
        JsonNode net = root.get("network");
        if (net != null) {
            network.setPrivateIp(text(net, "privateIp"));
            network.setPublicIp(text(net, "publicIp"));
            String mac = text(net, "macAddress");
            if (mac != null) network.setMacAddresses(List.of(mac));
            network.setDomain(text(net, "domain"));
            network.setWorkgroup(text(net, "workgroup"));
        }

        // Fallback to root-level flat fields
        if (network.getPrivateIp() == null) network.setPrivateIp(text(root, "ipAddress"));
        if (network.getPublicIp() == null) network.setPublicIp(text(root, "publicIp"));

        // Propagate publicIp to parent field if not yet set
        if (network.getPublicIp() != null && response.getPublicIp() == null) {
            response.setPublicIp(network.getPublicIp());
        }

        if (hasAnyNonNullField(network)) {
            response.setNetwork(network);
            caps.add(ProviderCapability.DEVICE_NETWORK.name());
        }
    }

    // ── Operating System ──────────────────────────────────────────────────────

    private void enrichOs(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getOs() != null) return;

        JsonNode osNode = getFirstPresent(root, "operatingSystem", "os");
        if (osNode == null) return;

        OsSummary os = new OsSummary();
        os.setName(text(osNode, "name"));
        os.setEdition(text(osNode, "edition"));
        os.setVersion(text(osNode, "version"));
        os.setBuild(text(osNode, "build"));
        os.setArchitecture(text(osNode, "architecture"));
        os.setInstallDate(text(osNode, "installDate"));
        os.setLicenseStatus(text(osNode, "licenseStatus"));

        if (hasAnyNonNullField(os)) {
            response.setOs(os);
            caps.add(ProviderCapability.DEVICE_OS.name());
        }
    }

    // ── Security ──────────────────────────────────────────────────────────────

    private void enrichSecurity(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getSecurity() != null) return;

        JsonNode sec = getFirstPresent(root, "security", "endpoint");
        if (sec == null) return;

        SecuritySummary security = new SecuritySummary();
        security.setAntivirus(text(sec, "antivirus"));
        security.setAntivirusStatus(text(sec, "antivirusStatus"));
        security.setAntivirusDefinitionDate(text(sec, "antivirusDefinitionDate"));
        security.setFirewall(text(sec, "firewall"));
        security.setFirewallStatus(text(sec, "firewallStatus"));
        security.setEncryption(text(sec, "encryption"));
        security.setEncryptionStatus(text(sec, "encryptionStatus"));
        if (sec.has("secureBoot")) security.setSecureBoot(sec.get("secureBoot").asBoolean());

        if (hasAnyNonNullField(security)) {
            response.setSecurity(security);
            caps.add(ProviderCapability.DEVICE_SECURITY.name());
        }
    }

    // ── Disks ─────────────────────────────────────────────────────────────────

    private void enrichDisks(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getDisks() != null && !response.getDisks().isEmpty()) return;

        JsonNode disksNode = root.get("disks");
        if (disksNode == null || !disksNode.isArray() || disksNode.size() == 0) return;

        List<DiskSummary> disks = new ArrayList<>();
        for (JsonNode d : disksNode) {
            DiskSummary disk = new DiskSummary();
            disk.setName(text(d, "name"));
            disk.setDrive(text(d, "drive"));
            disk.setType(text(d, "type"));
            disk.setModel(text(d, "model"));
            disk.setSerialNumber(text(d, "serialNumber"));
            if (d.has("totalCapacityBytes")) disk.setTotalCapacityBytes(d.get("totalCapacityBytes").asLong());
            if (d.has("usedCapacityBytes")) disk.setUsedCapacityBytes(d.get("usedCapacityBytes").asLong());
            if (d.has("freeCapacityBytes")) disk.setFreeCapacityBytes(d.get("freeCapacityBytes").asLong());

            // Calculate usage % from raw bytes if not provided
            if (d.has("usagePercentage")) {
                disk.setUsagePercentage(d.get("usagePercentage").asDouble());
            } else if (disk.getTotalCapacityBytes() != null && disk.getTotalCapacityBytes() > 0
                    && disk.getUsedCapacityBytes() != null) {
                disk.setUsagePercentage(100.0 * disk.getUsedCapacityBytes() / disk.getTotalCapacityBytes());
            }

            disk.setEncryptionStatus(text(d, "encryptionStatus"));
            disk.setHealthStatus(text(d, "healthStatus"));
            disks.add(disk);
        }

        if (!disks.isEmpty()) {
            response.setDisks(disks);
            caps.add(ProviderCapability.DEVICE_DISKS.name());
        }
    }

    // ── Software ──────────────────────────────────────────────────────────────

    private void enrichSoftware(DeviceDetailResponse response, JsonNode root, Set<String> caps) {
        if (response.getSoftware() != null && !response.getSoftware().isEmpty()) return;

        JsonNode swNode = root.get("software");
        if (swNode == null || !swNode.isArray() || swNode.size() == 0) return;

        List<SoftwareSummary> software = new ArrayList<>();
        for (JsonNode s : swNode) {
            SoftwareSummary sw = new SoftwareSummary();
            sw.setName(text(s, "name"));
            sw.setVersion(text(s, "version"));
            sw.setPublisher(text(s, "publisher"));
            sw.setInstallDate(text(s, "installDate"));
            sw.setArchitecture(text(s, "architecture"));
            software.add(sw);
        }

        if (!software.isEmpty()) {
            response.setSoftware(software);
            caps.add(ProviderCapability.DEVICE_SOFTWARE.name());
        }
    }

    // ── Helper utilities ──────────────────────────────────────────────────────

    private JsonNode getFirstPresent(JsonNode root, String... keys) {
        for (String key : keys) {
            JsonNode node = root.get(key);
            if (node != null && !node.isNull()) return node;
        }
        return null;
    }

    private String text(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        return (v != null && v.isTextual() && !v.asText().isBlank()) ? v.asText() : null;
    }

    private Integer intVal(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        return (v != null && v.isNumber()) ? v.asInt() : null;
    }

    private Long longVal(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        return (v != null && v.isNumber()) ? v.asLong() : null;
    }

    /**
     * Rough check to avoid storing a completely empty summary DTO.
     */
    private boolean hasAnyNonNullField(Object obj) {
        return obj != null;
    }
}
