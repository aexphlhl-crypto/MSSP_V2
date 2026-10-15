-- V2__subscription_schema.sql

-- Global Plans Table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Plan Features Mapping (Global)
CREATE TABLE plan_features (
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    PRIMARY KEY (plan_id, feature_key)
);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);

-- Tenant Subscriptions (Tenant-Owned)
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_tenant_subs_tenant_id ON tenant_subscriptions(tenant_id);
CREATE UNIQUE INDEX idx_active_tenant_sub ON tenant_subscriptions(tenant_id) WHERE status = 'ACTIVE';
