CREATE TABLE provider_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    initiated_by UUID NOT NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    result_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_actions_tenant_id ON provider_actions(tenant_id);
