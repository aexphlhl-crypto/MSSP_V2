-- V24__Create_Provider_Error_SLA.sql

CREATE TABLE provider_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_run_id UUID NOT NULL,
    provider_connection_id UUID,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_errors_sync_run_id ON provider_errors(sync_run_id);
CREATE INDEX idx_provider_errors_connection_id ON provider_errors(provider_connection_id);
