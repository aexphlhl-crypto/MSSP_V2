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
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest(classes = MSPApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CopilotEvidenceTest {

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
    private String invalidToken;

    @BeforeEach
    public void setup() {
        tenantAToken = jwtTokenProvider.generateToken("user-a@example.com", "ROLE_CUSTOMER", "tenant-a");
        tenantBToken = jwtTokenProvider.generateToken("user-b@example.com", "ROLE_CUSTOMER", "tenant-b");
        invalidToken = tenantAToken + "invalid";

        createData("tenant-a", "trace-123", "obj-a");
        createData("tenant-b", "trace-123", "obj-b");
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
    public void testSameTenantCopilotTrace() throws Exception {
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantAToken)
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Insufficient provider evidence"))))
                .andExpect(content().string(containsString("obj-a"))); // Based on asset/trace matching if any
    }

    @Test
    public void testCrossTenantCopilotTrace_MustFail() throws Exception {
        // Trace-only belonging to Tenant B is requested by Tenant A
        createData("tenant-b", "trace-b-only", "obj-b-only");
        
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantAToken)
                .param("query", "test")
                .param("rawProviderData", "trace-b-only"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Insufficient provider evidence")))
                .andExpect(content().string(not(containsString("obj-b-only"))));
    }

    @Test
    public void testDuplicateSyncRunIdAcrossTenants() throws Exception {
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantAToken)
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Insufficient provider evidence"))))
                .andExpect(content().string(not(containsString("obj-b")))); // Tenant B's obj-b must be absent

        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantBToken)
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Insufficient provider evidence"))))
                .andExpect(content().string(not(containsString("obj-a")))); // Tenant A's obj-a must be absent
    }
    
    @Test
    public void testXTenantIdSpoofing_IsIgnored() throws Exception {
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantAToken)
                .header("X-Tenant-ID", "tenant-b")
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Insufficient provider evidence"))))
                .andExpect(content().string(not(containsString("obj-b")))); // Still accesses A's, ignores header B
    }

    @Test
    public void testSpoofedTenantHeaderWithCrossTenantTrace() throws Exception {
        createData("tenant-b", "trace-b-only", "obj-b-only");
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + tenantAToken)
                .header("X-Tenant-ID", "tenant-b")
                .param("query", "test")
                .param("rawProviderData", "trace-b-only"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Insufficient provider evidence")))
                .andExpect(content().string(not(containsString("obj-b-only"))));
    }

    @Test
    public void testInvalidUnauthenticatedToken() throws Exception {
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .header("Authorization", "Bearer " + invalidToken)
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isUnauthorized()); // Should trigger 401
    }
    
    @Test
    public void testMissingAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/v1/copilot/analyze")
                .param("query", "test")
                .param("rawProviderData", "trace-123"))
                .andExpect(status().isUnauthorized()); // Should trigger 401
    }
}
