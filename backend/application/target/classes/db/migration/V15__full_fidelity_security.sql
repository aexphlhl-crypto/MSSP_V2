CREATE TABLE deception_assets (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    provider_connection_id UUID,
    provider_object_id VARCHAR(255),
    raw_data_reference TEXT
);

CREATE TABLE security_campaigns (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    provider_connection_id UUID,
    provider_object_id VARCHAR(255),
    raw_data_reference TEXT
);
