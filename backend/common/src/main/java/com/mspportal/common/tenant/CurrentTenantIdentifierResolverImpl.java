package com.mspportal.common.tenant;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

@Component
public class CurrentTenantIdentifierResolverImpl implements CurrentTenantIdentifierResolver<String> {

    @Override
    public String resolveCurrentTenantIdentifier() {
        String tenantId = TenantContext.getCurrentTenant();
        // Return a default schema/tenant for startup/auth if null
        return tenantId != null ? tenantId : "PUBLIC";
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
