-- V7__monitoring_seed.sql

-- Bronze Tenant Seeds
INSERT INTO sites (id, tenant_id, name, identifier, description, address, city, country, timezone, status)
VALUES ('b0000000-0000-0000-0000-000000000001', 'TENANT_BRONZE', 'Bronze HQ', 'BRZ-HQ', 'Headquarters', '123 Bronze St', 'Bronze City', 'US', 'UTC', 'ACTIVE');

INSERT INTO devices (id, tenant_id, site_id, hostname, display_name, ip_address, device_type, operating_system, status, monitoring_enabled, last_seen_at)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'TENANT_BRONZE', 'b0000000-0000-0000-0000-000000000001', 'SERVER-BRZ-01', 'Web Server', '10.0.0.10', 'SERVER', 'Linux', 'ONLINE', true, CURRENT_TIMESTAMP),
('d0000000-0000-0000-0000-000000000002', 'TENANT_BRONZE', 'b0000000-0000-0000-0000-000000000001', 'ROUTER-BRZ-01', 'Core Router', '10.0.0.1', 'ROUTER', 'Cisco IOS', 'WARNING', true, CURRENT_TIMESTAMP);

INSERT INTO alerts (id, tenant_id, device_id, type, severity, title, message, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'TENANT_BRONZE', 'd0000000-0000-0000-0000-000000000002', 'HIGH_CPU', 'WARNING', 'High CPU Usage Detected', 'CPU usage exceeded 85% for 15 minutes', 'OPEN');


-- Gold Tenant Seeds
INSERT INTO sites (id, tenant_id, name, identifier, description, address, city, country, timezone, status)
VALUES ('e0000000-0000-0000-0000-000000000001', 'TENANT_GOLD', 'Gold Main Campus', 'GLD-MAIN', 'Main Campus', '456 Gold Ave', 'Gold City', 'US', 'UTC', 'ACTIVE');

INSERT INTO devices (id, tenant_id, site_id, hostname, display_name, ip_address, device_type, operating_system, status, monitoring_enabled, last_seen_at)
VALUES 
('d0000000-0000-0000-0000-000000000003', 'TENANT_GOLD', 'e0000000-0000-0000-0000-000000000001', 'SERVER-GLD-01', 'Database Server', '10.1.0.20', 'SERVER', 'Windows Server 2022', 'CRITICAL', true, CURRENT_TIMESTAMP),
('d0000000-0000-0000-0000-000000000004', 'TENANT_GOLD', 'e0000000-0000-0000-0000-000000000001', 'SWITCH-GLD-01', 'Core Switch', '10.1.0.2', 'SWITCH', 'Aruba', 'ONLINE', true, CURRENT_TIMESTAMP);

INSERT INTO alerts (id, tenant_id, device_id, type, severity, title, message, status)
VALUES ('a0000000-0000-0000-0000-000000000002', 'TENANT_GOLD', 'd0000000-0000-0000-0000-000000000003', 'DEVICE_OFFLINE', 'CRITICAL', 'Device Offline', 'Device has not reported metrics for 5 minutes', 'OPEN');
