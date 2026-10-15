CREATE TABLE backup_repositories (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    capacity_bytes BIGINT,
    used_bytes BIGINT,
    last_check_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE TABLE backup_jobs (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    repository_id UUID NOT NULL REFERENCES backup_repositories(id) ON DELETE RESTRICT,
    source_type VARCHAR(50),
    source_name VARCHAR(255),
    schedule VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    retention_days INTEGER,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_backup_jobs_tenant_status ON backup_jobs(tenant_id, status);
CREATE INDEX idx_backup_jobs_tenant_next_run ON backup_jobs(tenant_id, next_run_at);

CREATE TABLE backup_executions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    job_id UUID NOT NULL REFERENCES backup_jobs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    duration_seconds BIGINT,
    data_transferred_bytes BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_backup_execs_tenant_job_start ON backup_executions(tenant_id, job_id, started_at);
CREATE INDEX idx_backup_execs_tenant_status ON backup_executions(tenant_id, status);

CREATE TABLE backup_alerts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    job_id UUID REFERENCES backup_jobs(id) ON DELETE SET NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_backup_alerts_tenant_severity_status ON backup_alerts(tenant_id, severity, status);
CREATE INDEX idx_backup_alerts_tenant_created_at ON backup_alerts(tenant_id, created_at);
