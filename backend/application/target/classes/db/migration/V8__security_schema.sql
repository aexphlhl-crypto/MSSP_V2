CREATE TABLE security_events (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    endpoint_id UUID,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(255),
    detected_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_security_events_tenant_severity ON security_events(tenant_id, severity);
CREATE INDEX idx_security_events_tenant_status ON security_events(tenant_id, status);
CREATE INDEX idx_security_events_tenant_detected_at ON security_events(tenant_id, detected_at);

CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    endpoint_id UUID,
    cve_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    cvss_score DOUBLE PRECISION,
    detected_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_vulnerabilities_tenant_severity ON vulnerabilities(tenant_id, severity);
CREATE INDEX idx_vulnerabilities_tenant_status ON vulnerabilities(tenant_id, status);
CREATE INDEX idx_vulnerabilities_tenant_detected_at ON vulnerabilities(tenant_id, detected_at);

CREATE TABLE security_endpoints (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    device_id UUID,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    protection_status VARCHAR(50) NOT NULL,
    agent_version VARCHAR(50),
    last_check_at TIMESTAMP WITH TIME ZONE,
    risk_score INTEGER,
    isolation_supported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_security_endpoints_tenant_protection ON security_endpoints(tenant_id, protection_status);
