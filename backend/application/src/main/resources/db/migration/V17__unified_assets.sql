CREATE TABLE unified_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hostname VARCHAR(255),
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    os_name VARCHAR(255),
    os_version VARCHAR(255),
    asset_type VARCHAR(50),
    status VARCHAR(50),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unified_asset_provider_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    unified_asset_id UUID NOT NULL REFERENCES unified_assets(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL,
    provider_asset_id VARCHAR(255) NOT NULL,
    provider_asset_type VARCHAR(50),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unified_assets_tenant_id ON unified_assets(tenant_id);
CREATE INDEX idx_unified_asset_provider_links_tenant_id ON unified_asset_provider_links(tenant_id);
CREATE INDEX idx_unified_asset_provider_links_asset_id ON unified_asset_provider_links(unified_asset_id);
