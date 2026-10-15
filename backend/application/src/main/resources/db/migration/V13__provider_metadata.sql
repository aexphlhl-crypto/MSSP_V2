-- Add provider metadata columns to security_events
ALTER TABLE security_events 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to security_endpoints
ALTER TABLE security_endpoints 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to vulnerabilities
ALTER TABLE vulnerabilities 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to backup_jobs
ALTER TABLE backup_jobs 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to backup_executions
ALTER TABLE backup_executions 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to backup_repositories
ALTER TABLE backup_repositories 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to backup_alerts
ALTER TABLE backup_alerts 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to devices
ALTER TABLE devices 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);

-- Add provider metadata columns to alerts
ALTER TABLE alerts 
ADD COLUMN provider_connection_id UUID REFERENCES provider_connections(id),
ADD COLUMN provider_name VARCHAR(100),
ADD COLUMN provider_object_id VARCHAR(255),
ADD COLUMN raw_data_reference UUID REFERENCES provider_raw_data(id);
