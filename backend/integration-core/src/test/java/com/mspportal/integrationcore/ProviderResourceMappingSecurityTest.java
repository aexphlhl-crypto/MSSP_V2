package com.mspportal.integrationcore;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.ProviderResourceType;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import com.mspportal.integrationcore.service.ProviderResourceMappingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProviderResourceMappingSecurityTest {

    @Mock
    private ProviderResourceMappingRepository mappingRepository;

    @Mock
    private ProviderConnectionRepository providerConnectionRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ProviderResourceMappingService service;

    private final String TENANT_A = "TENANT_A";
    private final String TENANT_B = "TENANT_B";
    private final UUID connectionId = UUID.randomUUID();
    private final UUID siteId = UUID.randomUUID();
    private final String externalId = "ext-123";

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentTenant(TENANT_A);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void tenantACanMapOwnConnectionToOwnSite() {
        // Setup
        ProviderConnection conn = new ProviderConnection();
        conn.setId(connectionId);
        conn.setTenantId(TENANT_A);
        
        when(providerConnectionRepository.findById(connectionId)).thenReturn(Optional.of(conn));
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(siteId), eq(TENANT_A)))
                .thenReturn(1); // Site exists for Tenant A
        
        when(mappingRepository.findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                connectionId, ProviderResourceType.SITE, externalId)).thenReturn(Optional.empty());
                
        when(mappingRepository.save(any(ProviderResourceMapping.class))).thenAnswer(i -> i.getArgument(0));

        // Execute
        ProviderResourceMapping result = service.upsert(connectionId, ProviderResourceType.SITE, externalId, null, siteId);
        
        // Verify
        assertNotNull(result);
        assertEquals(TENANT_A, result.getTenantId());
        assertEquals(siteId, result.getInternalResourceId());
        verify(mappingRepository, times(1)).save(any());
    }

    @Test
    void tenantACannotMapOwnConnectionToTenantBSite() {
        // Setup
        ProviderConnection conn = new ProviderConnection();
        conn.setId(connectionId);
        conn.setTenantId(TENANT_A);
        
        when(providerConnectionRepository.findById(connectionId)).thenReturn(Optional.of(conn));
        
        // Mock site doesn't exist for Tenant A
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(siteId), eq(TENANT_A)))
                .thenReturn(0); 
                
        // Execute & Verify
        assertThrows(AccessDeniedException.class, () -> 
            service.upsert(connectionId, ProviderResourceType.SITE, externalId, null, siteId)
        );
        
        verify(mappingRepository, never()).save(any());
    }

    @Test
    void tenantACannotUseTenantBConnection() {
        // Setup
        ProviderConnection conn = new ProviderConnection();
        conn.setId(connectionId);
        conn.setTenantId(TENANT_B);
        
        when(providerConnectionRepository.findById(connectionId)).thenReturn(Optional.of(conn));
                
        // Execute & Verify
        assertThrows(AccessDeniedException.class, () -> 
            service.upsert(connectionId, ProviderResourceType.SITE, externalId, null, siteId)
        );
        
        verify(jdbcTemplate, never()).queryForObject(anyString(), eq(Integer.class), any(), any());
        verify(mappingRepository, never()).save(any());
    }

    @Test
    void duplicateUpsertIsIdempotent() {
        // Setup
        ProviderConnection conn = new ProviderConnection();
        conn.setId(connectionId);
        conn.setTenantId(TENANT_A);
        
        ProviderResourceMapping existingMapping = new ProviderResourceMapping();
        existingMapping.setTenantId(TENANT_A);
        existingMapping.setInternalResourceId(UUID.randomUUID());
        
        when(providerConnectionRepository.findById(connectionId)).thenReturn(Optional.of(conn));
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(siteId), eq(TENANT_A)))
                .thenReturn(1); 
        
        when(mappingRepository.findByProviderConnectionIdAndResourceTypeAndExternalResourceId(
                connectionId, ProviderResourceType.SITE, externalId)).thenReturn(Optional.of(existingMapping));
                
        when(mappingRepository.save(any(ProviderResourceMapping.class))).thenAnswer(i -> i.getArgument(0));

        // Execute
        ProviderResourceMapping result = service.upsert(connectionId, ProviderResourceType.SITE, externalId, null, siteId);
        
        // Verify
        assertEquals(siteId, result.getInternalResourceId()); // Updated to new site ID
        verify(mappingRepository, times(1)).save(existingMapping); // Re-saved existing entity, not a new one
    }
}
