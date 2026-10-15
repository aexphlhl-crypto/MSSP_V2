package com.mspportal.integration;

/**
 * Generic abstraction for all 3rd-party vendor integrations.
 * 
 * Each domain (Security, Backup, Monitoring) will implement this interface
 * to standardize how we connect, authenticate, and sync data from external
 * MSP tools (e.g., CrowdStrike, Veeam, Datto RMM) into our platform.
 * 
 * This ensures business modules do not directly depend on vendor SDKs,
 * allowing us to easily swap or add new vendors in the future.
 */
public interface VendorConnector {
    
    /**
     * Initializes the connection to the vendor using the provided tenant's credentials.
     * @param tenantId The ID of the tenant whose credentials should be used.
     * @return true if connection is successful.
     */
    boolean connect(String tenantId);

    /**
     * @return The unique identifier of the vendor (e.g., "VEEAM_BACKUP", "CROWDSTRIKE").
     */
    String getVendorCode();
}
