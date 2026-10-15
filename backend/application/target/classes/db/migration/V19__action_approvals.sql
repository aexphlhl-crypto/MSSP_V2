CREATE TABLE action_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    provider_action_id UUID NOT NULL REFERENCES provider_actions(id) ON DELETE CASCADE,
    approver_id UUID,
    status VARCHAR(50) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acted_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action_approvals_tenant_id ON action_approvals(tenant_id);
CREATE INDEX idx_action_approvals_action_id ON action_approvals(provider_action_id);
