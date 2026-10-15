package com.mspportal.application;

import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.monitoring.provider.ZabbixClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

@SpringBootTest(classes = MSPApplication.class)
public class ZabbixDiagnosticsTest {

    private static final Logger log = LoggerFactory.getLogger(ZabbixDiagnosticsTest.class);

    @Autowired
    private ZabbixClient zabbixClient;

    @Autowired
    private ProviderConnectionRepository connectionRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @BeforeEach
    public void setTenantContext() {
        // Set tenant BEFORE the JPA session opens in the @Test method.
        // @Transactional on the test opens the Hibernate session when the method starts,
        // so the CurrentTenantIdentifierResolver must return the correct tenant at that moment.
        com.mspportal.common.tenant.TenantContext.setCurrentTenant("SYS_ADMIN");
    }

    @Test
    public void runDiagnostics() {
        log.info("==================================================");
        log.info("ZABBIX DIRECT E2E DIAGNOSTICS");
        log.info("==================================================");

        // Tenant is already set by @BeforeEach; reaffirm here for safety
        com.mspportal.common.tenant.TenantContext.setCurrentTenant("SYS_ADMIN");
        
        List<ProviderConnection> connections = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery("SELECT id, tenant_id, provider_name, base_url, display_name FROM provider_connections").getResultList();
            for (Object[] row : rows) {
                ProviderConnection conn = new ProviderConnection();
                conn.setId(UUID.fromString(String.valueOf(row[0])));
                conn.setTenantId(String.valueOf(row[1]));
                conn.setProviderName(String.valueOf(row[2]));
                conn.setBaseUrl(String.valueOf(row[3]));
                conn.setDisplayName(String.valueOf(row[4]));
                connections.add(conn);
            }
        } catch (Exception ex) {
            log.error("Direct NativeQuery fetch failed", ex);
        }

        ProviderConnection zabbixConn = null;
        for (ProviderConnection conn : connections) {
            log.info("Inspecting Connection: id={}, name={}, tenant={}", conn.getId(), conn.getProviderName(), conn.getTenantId());
            // Hardcode target to the active connection 4e19f8df-993e-4610-8a7d-cf6d07ea69cf
            if ("4e19f8df-993e-4610-8a7d-cf6d07ea69cf".equals(conn.getId().toString())) {
                zabbixConn = conn;
            }
        }

        if (zabbixConn == null) {
            log.error("RESULT: No Zabbix connection found in the database. Please make sure Zabbix connection is configured first.");
            return;
        }

        UUID connectionId = zabbixConn.getId();
        log.info("Using ProviderConnection: id={}, name={}, baseUrl={}", connectionId, zabbixConn.getDisplayName(), zabbixConn.getBaseUrl());

        // STEP 1: Authenticate
        String token = null;
        try {
            // Find credential for connection id 4e19f8df-993e-4610-8a7d-cf6d07ea69cf manually using Native Query
            List<String> creds = entityManager.createNativeQuery("SELECT secret_value FROM provider_credentials WHERE provider_connection_id = '4e19f8df-993e-4610-8a7d-cf6d07ea69cf'").getResultList();
            if (creds.isEmpty()) {
                throw new IllegalStateException("Credentials not found in DB for 4e19f8df-993e-4610-8a7d-cf6d07ea69cf");
            }
            String secretValue = String.valueOf(creds.get(0));
            log.info("Directly retrieved secretValue from DB (starts with: {})", secretValue.substring(0, Math.min(secretValue.length(), 5)));
            
            // Tenant already set to SYS_ADMIN by @BeforeEach
            token = zabbixClient.authenticateFresh(connectionId);
            log.info("STEP 1 AUTHENTICATION: SUCCESS");
        } catch (Exception e) {
            log.error("STEP 1 AUTHENTICATION: FAILED - {}", e.getMessage());
            return;
        }

        // STEP 2: Find "Zabbix server" Host
        String targetHostId = null;
        String targetHostName = null;
        try {
            List<Map<String, Object>> hosts = zabbixClient.getHosts(connectionId);
            log.info("Found {} hosts in Zabbix", hosts.size());
            for (Map<String, Object> host : hosts) {
                String hostName = (String) host.get("name");
                String hostId = (String) host.get("hostid");
                log.info("  Host: hostid={}, name={}, status={}", hostId, hostName, host.get("status"));
                if ("Zabbix server".equalsIgnoreCase(hostName)) {
                    targetHostId = hostId;
                    targetHostName = hostName;
                }
            }
            if (targetHostId != null) {
                log.info("STEP 2 TARGET HOST: FOUND (hostid={}, name={})", targetHostId, targetHostName);
            } else {
                log.warn("STEP 2 TARGET HOST: NOT FOUND 'Zabbix server'");
                if (!hosts.isEmpty()) {
                    // fallback to the first host to get metrics anyway
                    Map<String, Object> firstHost = hosts.get(0);
                    targetHostId = (String) firstHost.get("hostid");
                    targetHostName = (String) firstHost.get("name");
                    log.info("Using fallback first host: hostid={}, name={}", targetHostId, targetHostName);
                }
            }
        } catch (Exception e) {
            log.error("STEP 2 HOST DISCOVERY: FAILED - {}", e.getMessage());
            return;
        }

        if (targetHostId == null) {
            log.error("No host found to run items/problems queries on.");
            return;
        }

        // STEP 3: Directly test item.get
        try {
            List<Map<String, Object>> items = zabbixClient.getItems(connectionId, targetHostId);
            log.info("STEP 3 ITEM.GET REQUEST: SUCCESS");
            log.info("Items returned: {}", items.size());

            boolean cpuFound = false;
            boolean memFound = false;
            boolean diskFound = false;

            for (Map<String, Object> item : items) {
                String name = (String) item.get("name");
                String key = (String) item.get("key_");
                String lastvalue = (String) item.get("lastvalue");
                String units = (String) item.get("units");
                String lastclock = String.valueOf(item.get("lastclock"));
                String itemid = (String) item.get("itemid");

                boolean matches = false;
                if (key.contains("cpu") || name.toLowerCase().contains("cpu utilization")) {
                    log.info("CPU ITEM: itemid={}, name='{}', key='{}', lastvalue='{}', units='{}', lastclock={}",
                            itemid, name, key, lastvalue, units, lastclock);
                    cpuFound = true;
                    matches = true;
                }
                if (key.contains("memory") || key.contains("vm.memory") || name.toLowerCase().contains("memory utilization") || name.toLowerCase().contains("available memory")) {
                    log.info("MEMORY ITEM: itemid={}, name='{}', key='{}', lastvalue='{}', units='{}', lastclock={}",
                            itemid, name, key, lastvalue, units, lastclock);
                    memFound = true;
                    matches = true;
                }
                if (key.contains("vfs.fs") || name.toLowerCase().contains("space utilization") || name.toLowerCase().contains("disk")) {
                    log.info("DISK ITEM: itemid={}, name='{}', key='{}', lastvalue='{}', units='{}', lastclock={}",
                            itemid, name, key, lastvalue, units, lastclock);
                    diskFound = true;
                    matches = true;
                }

                if (!matches && (name.toLowerCase().contains("utilization") || name.toLowerCase().contains("used") || name.toLowerCase().contains("free"))) {
                    log.info("OTHER POTENTIAL METRIC: itemid={}, name='{}', key='{}', lastvalue='{}', units='{}'",
                            itemid, name, key, lastvalue, units);
                }
            }

            log.info("Metrics Summary -> CPU: {}, MEMORY: {}, DISK: {}",
                    cpuFound ? "FOUND" : "NOT FOUND",
                    memFound ? "FOUND" : "NOT FOUND",
                    diskFound ? "FOUND" : "NOT FOUND");

        } catch (Exception e) {
            log.error("STEP 3 ITEM.GET REQUEST: FAILED - {}", e.getMessage());
        }

        // STEP 4: Directly test problem.get
        try {
            List<Map<String, Object>> problems = zabbixClient.getProblems(connectionId, targetHostId);
            log.info("STEP 4 PROBLEM.GET REQUEST: SUCCESS");
            log.info("Problems returned: {}", problems.size());

            for (Map<String, Object> prob : problems) {
                log.info("PROBLEM: eventid={}, name='{}', severity={}, clock={}, acknowledged={}, r_eventid={}, r_clock={}",
                        prob.get("eventid"), prob.get("name"), prob.get("severity"), prob.get("clock"),
                        prob.get("acknowledged"), prob.get("r_eventid"), prob.get("r_clock"));
            }
        } catch (Exception e) {
            log.error("STEP 4 PROBLEM.GET REQUEST: FAILED - {}", e.getMessage());
        }

        log.info("==================================================");
    }
}
