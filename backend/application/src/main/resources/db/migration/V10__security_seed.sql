-- Bronze Tenant Mock Data
INSERT INTO security_endpoints (id, tenant_id, device_id, hostname, ip_address, protection_status, agent_version, last_check_at, risk_score, isolation_supported)
VALUES
('b1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', NULL, 'SERVER-01', '192.168.1.100', 'PROTECTED', '2.0.1', CURRENT_TIMESTAMP, 10, true),
('b2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', NULL, 'SERVER-CRITICAL', '192.168.1.200', 'WARNING', '2.0.0', CURRENT_TIMESTAMP, 95, true),
('b3333333-3333-3333-3333-333333333333', 'TENANT_BRONZE', NULL, 'WORKSTATION-01', '192.168.1.50', 'UNPROTECTED', '1.9.5', CURRENT_TIMESTAMP, 80, false);

INSERT INTO security_events (id, tenant_id, endpoint_id, type, severity, status, title, description, detected_at)
VALUES
('e1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'b2222222-2222-2222-2222-222222222222', 'RANSOMWARE', 'CRITICAL', 'OPEN', 'Ransomware Activity Detected', 'Mass file encryption detected on E: drive.', CURRENT_TIMESTAMP),
('e2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', 'b3333333-3333-3333-3333-333333333333', 'MALWARE', 'HIGH', 'OPEN', 'Trojan Downloader Blocked', 'Antivirus blocked a known trojan executable.', CURRENT_TIMESTAMP),
('e3333333-3333-3333-3333-333333333333', 'TENANT_BRONZE', 'b1111111-1111-1111-1111-111111111111', 'PORT_SCAN', 'LOW', 'ACKNOWLEDGED', 'Internal Port Scan', 'Nmap scan detected from internal subnet.', CURRENT_TIMESTAMP);

INSERT INTO vulnerabilities (id, tenant_id, endpoint_id, cve_id, title, description, severity, status, cvss_score, detected_at)
VALUES
('f1111111-1111-1111-1111-111111111111', 'TENANT_BRONZE', 'b2222222-2222-2222-2222-222222222222', 'CVE-2021-44228', 'Log4Shell Vulnerability', 'Apache Log4j2 JNDI features do not protect against attacker controlled LDAP.', 'CRITICAL', 'OPEN', 10.0, CURRENT_TIMESTAMP),
('f2222222-2222-2222-2222-222222222222', 'TENANT_BRONZE', 'b3333333-3333-3333-3333-333333333333', 'CVE-2023-23397', 'Microsoft Outlook EoP', 'Elevation of Privilege vulnerability in Microsoft Outlook.', 'HIGH', 'OPEN', 9.8, CURRENT_TIMESTAMP);

-- Gold Tenant Mock Data
INSERT INTO security_endpoints (id, tenant_id, device_id, hostname, ip_address, protection_status, agent_version, last_check_at, risk_score, isolation_supported)
VALUES
('c1111111-1111-1111-1111-111111111111', 'TENANT_GOLD', NULL, 'GOLD-DB-01', '10.0.0.50', 'PROTECTED', '2.0.1', CURRENT_TIMESTAMP, 5, true);
