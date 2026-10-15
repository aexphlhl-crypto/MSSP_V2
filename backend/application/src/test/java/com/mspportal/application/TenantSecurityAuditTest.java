package com.mspportal.application;

import com.mspportal.auth.security.JwtTokenProvider;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderRawData;
import com.mspportal.integrationcore.enums.ProviderStatus;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.repository.ProviderRawDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest(classes = MSPApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TenantSecurityAuditTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ProviderRawDataRepository providerRawDataRepository;

    @Autowired
    private ProviderConnectionRepository providerConnectionRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    private String tenantAToken;
    private String tenantBToken;
    private String adminToken;

    @BeforeEach
    public void setup() {
        tenantAToken = jwtTokenProvider.generateToken("user-a@example.com", "ROLE_CUSTOMER", "tenant-a");
        tenantBToken = jwtTokenProvider.generateToken("user-b@example.com", "ROLE_CUSTOMER", "tenant-b");
        adminToken = jwtTokenProvider.generateToken("admin@example.com", "ROLE_PLATFORM_ADMIN", "system");

        createData("tenant-a", "trace-123", "obj-a");
        createData("tenant-b", "trace-123", "obj-b");
        createData("tenant-a", "trace-sys", "obj-sys");
    }

    @org.junit.jupiter.api.AfterEach
    public void cleanup() {
        providerRawDataRepository.deleteAll();
        providerConnectionRepository.deleteAll();
    }

    private void createData(String tenantId, String syncRunId, String objectId) {
        com.mspportal.common.tenant.TenantContext.setCurrentTenant(tenantId);
        try {
            org.springframework.transaction.support.TransactionTemplate template = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
            template.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            template.execute(status -> {
                ProviderConnection conn = new ProviderConnection();
                conn.setTenantId(tenantId);
                conn.setProviderType(ProviderType.BACKUP);
                conn.setProviderName("Commvault");
                conn.setStatus(ProviderStatus.CONNECTED);
                conn = providerConnectionRepository.saveAndFlush(conn);

                ProviderRawData data = new ProviderRawData();
                data.setTenantId(tenantId);
                data.setProviderConnection(conn);
                data.setSyncRunId(syncRunId);
                data.setProviderObjectId(objectId);
                data.setProviderType(ProviderType.BACKUP);
                data.setProviderName("Commvault");
                data.setResourceType("Backup");
                data.setCollectedAt(Instant.now());
                data.setProviderTimestamp(Instant.now());
                data.setPayload("{}");
                providerRawDataRepository.saveAndFlush(data);
                entityManager.clear(); // Detach entities so later flushes under different TenantContext don't fail
                return null;
            });
        } finally {
            com.mspportal.common.tenant.TenantContext.clear();
        }
    }

    @Test
    public void testCrossTenantDataLineage_MustFail() throws Exception {
        // According to the controller, the fallback returns 404
        mockMvc.perform(get("/api/integration/data-lineage/object/obj-b")
                .header("Authorization", "Bearer " + tenantAToken))
                .andExpect(status().isNotFound()); // Officially documented contract is 404 to mask existence
    }

    @Test
    public void testCustomerPlatformAdminBoundary() throws Exception {
        // Platform admin test. We assume a platform admin endpoint exists at /api/v1/admin, or we can check preauthorize on a controller
        // Since we didn't explicitly implement Platform Admin in the provided snippet, we can test preauthorize
        // Wait, the controller used in the prompt was /api/integration/data-lineage/object/obj-sys which we can test
        
        mockMvc.perform(get("/api/integration/data-lineage/object/obj-sys")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound()); // Admin belongs to system, cannot access tenant-a
    }

    @Test
    public void testXTenantIdSpoofing_IsIgnored() throws Exception {
        mockMvc.perform(get("/api/integration/data-lineage/object/obj-a")
                .header("Authorization", "Bearer " + tenantAToken)
                .header("X-Tenant-ID", "tenant-b"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("obj-a")));
    }
}
