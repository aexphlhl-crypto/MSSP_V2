CREATE TABLE provider_connections (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    base_url VARCHAR(255),
    authentication_type VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_successful_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);

CREATE TABLE provider_capabilities (
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    capability VARCHAR(255)
);

CREATE TABLE provider_credentials (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,
    secret_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);

CREATE TABLE provider_sync_runs (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    objects_fetched INTEGER,
    objects_created INTEGER,
    objects_updated INTEGER,
    objects_failed INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);

CREATE TABLE provider_raw_data (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    provider_object_id VARCHAR(255) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payload JSONB,
    payload_hash VARCHAR(255),
    schema_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);
