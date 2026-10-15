package com.mspportal.monitoring.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.integrationcore.dto.ProviderDataResponse;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderResourceMapping;
import com.mspportal.integrationcore.enums.AuthorizationReason;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderType;
import com.mspportal.integrationcore.exception.ProviderAuthorizationException;
import com.mspportal.integrationcore.provider.MonitoringProvider;
import com.mspportal.integrationcore.provider.MonitoringProviderRegistry;
import com.mspportal.integrationcore.repository.ProviderResourceMappingRepository;
import com.mspportal.monitoring.entity.Device;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.subscription.service.SubscriptionEntitlementService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProviderDataAuthorizationTest {

    @Mock
    private DeviceRepository deviceRepository;
    @Mock
    private ProviderResourceMappingRepository mappingRepository;
    @Mock
    private MonitoringProviderRegistry providerRegistry;
    @Mock
    private SubscriptionEntitlementService entitlementService;
    @Mock
    private MonitoringServiceHelper helper;
    @Mock
    private MonitoringProvider monitoringProvider;

    @InjectMocks
    private ProviderDataService providerDataService;

    private MockedStatic<TenantContext> tenantContextMock;
    
    private final String TENANT_ID = "TENANT_A";
    private final UUID DEVICE_ID = UUID.randomUUID();
    private final UUID CONNECTION_ID = UUID.randomUUID();
    private final String EXTERNAL_ID = "ext-123";

    @BeforeEach
    void setUp() throws Exception {
        tenantContextMock = Mockito.mockStatic(TenantContext.class);
        tenantContextMock.when(TenantContext::getCurrentTenant).thenReturn(TENANT_ID);

        // Mock the helper to just execute the supplier directly for testing
        when(helper.withTenantImpersonationResult(any(), any())).thenAnswer(invocation -> {
            java.util.function.Supplier<?> supplier = invocation.getArgument(1);
            return supplier.get();
        });
    }

    @AfterEach
    void tearDown() {
        tenantContextMock.close();
    }

    private void setupValidMapping() {
        Device device = new Device();
        device.setId(DEVICE_ID);
        device.setTenantId(TENANT_ID);
        when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(device));

        ProviderConnection connection = new ProviderConnection();
        connection.setId(CONNECTION_ID);
        connection.setProviderName("ZABBIX");
        
        ProviderResourceMapping mapping = new ProviderResourceMapping();
        mapping.setProviderConnection(connection);
        mapping.setExternalResourceId(EXTERNAL_ID);
        
        when(mappingRepository.findByInternalResourceIdAndResourceTypeNative(eq(DEVICE_ID), any()))
                .thenReturn(Collections.singletonList(mapping));
    }

    @Test
    void testA_NoActiveSubscription() {
        setupValidMapping();
        when(entitlementService.checkProviderCapabilityEntitlement(TENANT_ID, "ZABBIX", ProviderCapability.APM))
                .thenReturn(AuthorizationReason.NO_ACTIVE_SUBSCRIPTION);

        ProviderAuthorizationException ex = assertThrows(ProviderAuthorizationException.class, () -> {
            providerDataService.getProviderData(DEVICE_ID, ProviderCapability.APM, null);
        });

        assertEquals(AuthorizationReason.NO_ACTIVE_SUBSCRIPTION, ex.getReason());
        verify(monitoringProvider, never()).getNativeProviderData(any(), any(), any());
    }

    @Test
    void testB_ProviderNotEntitled() {
        setupValidMapping();
        when(entitlementService.checkProviderCapabilityEntitlement(TENANT_ID, "ZABBIX", ProviderCapability.APM))
                .thenReturn(AuthorizationReason.PROVIDER_NOT_ENTITLED);

        ProviderAuthorizationException ex = assertThrows(ProviderAuthorizationException.class, () -> {
            providerDataService.getProviderData(DEVICE_ID, ProviderCapability.APM, null);
        });

        assertEquals(AuthorizationReason.PROVIDER_NOT_ENTITLED, ex.getReason());
        verify(monitoringProvider, never()).getNativeProviderData(any(), any(), any());
    }

    @Test
    void testC_CapabilityNotEntitled() {
        setupValidMapping();
        when(entitlementService.checkProviderCapabilityEntitlement(TENANT_ID, "ZABBIX", ProviderCapability.APM))
                .thenReturn(AuthorizationReason.CAPABILITY_NOT_ENTITLED);

        ProviderAuthorizationException ex = assertThrows(ProviderAuthorizationException.class, () -> {
            providerDataService.getProviderData(DEVICE_ID, ProviderCapability.APM, null);
        });

        assertEquals(AuthorizationReason.CAPABILITY_NOT_ENTITLED, ex.getReason());
        verify(monitoringProvider, never()).getNativeProviderData(any(), any(), any());
    }

    @Test
    void testD_ProviderAdapterDoesNotSupportCapability() {
        setupValidMapping();
        when(entitlementService.checkProviderCapabilityEntitlement(TENANT_ID, "ZABBIX", ProviderCapability.APM))
                .thenReturn(AuthorizationReason.ALLOW);

        when(providerRegistry.resolve("ZABBIX")).thenReturn(Optional.of(monitoringProvider));
        when(monitoringProvider.supportedCapabilities()).thenReturn(Set.of(ProviderCapability.DEVICE_METRICS)); // Missing APM

        ProviderAuthorizationException ex = assertThrows(ProviderAuthorizationException.class, () -> {
            providerDataService.getProviderData(DEVICE_ID, ProviderCapability.APM, null);
        });

        assertEquals(AuthorizationReason.PROVIDER_CAPABILITY_NOT_SUPPORTED, ex.getReason());
        verify(monitoringProvider, never()).getNativeProviderData(any(), any(), any());
    }

    @Test
    void testE_EverythingValid() {
        setupValidMapping();
        when(entitlementService.checkProviderCapabilityEntitlement(TENANT_ID, "ZABBIX", ProviderCapability.DEVICE_METRICS))
                .thenReturn(AuthorizationReason.ALLOW);

        when(providerRegistry.resolve("ZABBIX")).thenReturn(Optional.of(monitoringProvider));
        when(monitoringProvider.supportedCapabilities()).thenReturn(Set.of(ProviderCapability.DEVICE_METRICS));
        
        ProviderDataResponse mockResponse = ProviderDataResponse.builder()
                .provider("ZABBIX")
                .resourceId(EXTERNAL_ID)
                .capability(ProviderCapability.DEVICE_METRICS)
                .build();
        when(monitoringProvider.getNativeProviderData(CONNECTION_ID, EXTERNAL_ID, ProviderCapability.DEVICE_METRICS))
                .thenReturn(mockResponse);

        ProviderDataResponse response = providerDataService.getProviderData(DEVICE_ID, ProviderCapability.DEVICE_METRICS, null);

        assertNotNull(response);
        verify(monitoringProvider, times(1)).getNativeProviderData(CONNECTION_ID, EXTERNAL_ID, ProviderCapability.DEVICE_METRICS);
    }

    @Test
    void testF_DeviceBelongsToAnotherTenant() {
        // Device not found (Tenant context filtering usually applies at the repository level,
        // so findById returns empty if tenant doesn't own it)
        when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.empty());

        ProviderAuthorizationException ex = assertThrows(ProviderAuthorizationException.class, () -> {
            providerDataService.getProviderData(DEVICE_ID, ProviderCapability.DEVICE_METRICS, null);
        });

        assertEquals(AuthorizationReason.DEVICE_NOT_OWNED, ex.getReason());
        verify(mappingRepository, never()).findByInternalResourceIdAndResourceTypeNative(any(), any());
        verify(monitoringProvider, never()).getNativeProviderData(any(), any(), any());
    }
}
