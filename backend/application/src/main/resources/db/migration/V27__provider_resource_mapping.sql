-- V27__provider_resource_mapping.sql

CREATE TABLE provider_resource_mappings (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             VARCHAR(255) NOT NULL,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    resource_type         VARCHAR(50) NOT NULL,
    external_resource_id  VARCHAR(255) NOT NULL,
    external_parent_id    VARCHAR(255),
    internal_resource_id  UUID NOT NULL,
    sync_status           VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    last_synced_at        TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by            VARCHAR(255),
    CONSTRAINT uq_provider_resource_mapping 
        UNIQUE (tenant_id, provider_connection_id, resource_type, external_resource_id)
);

CREATE INDEX idx_prm_tenant_resource_type    ON provider_resource_mappings(tenant_id, resource_type);
CREATE INDEX idx_prm_provider_connection     ON provider_resource_mappings(provider_connection_id);
CREATE INDEX idx_prm_internal_resource       ON provider_resource_mappings(internal_resource_id, resource_type);
CREATE INDEX idx_prm_tenant_external         ON provider_resource_mappings(tenant_id, resource_type, external_resource_id);
