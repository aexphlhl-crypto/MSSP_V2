-- Bronze Tenant Mock Data
INSERT INTO backup_repositories (id, tenant_id, name, type, endpoint, status, capacity_bytes, used_bytes, last_check_at)
VALUES
('b1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'Local NAS', 'NFS', '192.168.1.200:/backups', 'ONLINE', 10000000000000, 2500000000000, CURRENT_TIMESTAMP),
('b2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', 'Cloud S3', 'S3', 's3.us-east-1.amazonaws.com/msp-backups', 'WARNING', 50000000000000, 48000000000000, CURRENT_TIMESTAMP);

INSERT INTO backup_jobs (id, tenant_id, name, repository_id, source_type, source_name, schedule, enabled, retention_days, last_run_at, next_run_at, status)
VALUES
('c1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'Server 01 Full Backup', 'b1111111-1111-1111-1111-111111111111', 'VM', 'SERVER-01', '0 0 2 * * *', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE'),
('c2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', 'Critical Server Backup', 'b2222222-2222-2222-2222-222222222222', 'FILE', 'SERVER-CRITICAL', '0 0 * * * *', true, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FAILED');

INSERT INTO backup_executions (id, tenant_id, job_id, started_at, finished_at, status, duration_seconds, data_transferred_bytes, error_message)
VALUES
('d1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'c1111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SUCCESS', 1500, 500000000000, NULL),
('d2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', 'c2222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FAILED', 120, 50000000, 'Insufficient storage in destination repository.');

INSERT INTO backup_alerts (id, tenant_id, job_id, severity, status, title, message, created_at)
VALUES
('a1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'c2222222-2222-2222-2222-222222222222', 'CRITICAL', 'OPEN', 'Backup Failed', 'Insufficient storage in destination repository.', CURRENT_TIMESTAMP);

-- Gold Tenant Mock Data
INSERT INTO backup_repositories (id, tenant_id, name, type, endpoint, status, capacity_bytes, used_bytes, last_check_at)
VALUES
('b3333333-3333-3333-3333-333333333333', 'TENANT_GOLD', 'Gold Cloud Repo', 'CLOUD', 'msp-cloud.com/gold', 'ONLINE', 100000000000000, 10000000000, CURRENT_TIMESTAMP);
