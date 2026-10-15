// DEVELOPMENT PREVIEW ONLY — never used in production
// Remove or disable when real provider data is available

export const FULL_DEVICE_MOCK: any = {
  id: 'preview-device-001',
  hostname: 'WIN-MSP-001',
  displayName: 'WIN-MSP-001',
  status: 'ONLINE',
  deviceType: 'PC',
  operatingSystem: 'Windows 11 Pro',
  ipAddress: '192.168.10.25',
  publicIp: '203.0.113.25',
  siteName: 'Hanoi Head Office',
  siteId: 'preview-site-01',
  lastSeenAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
  cpuUsage: 32,
  memoryUsage: 61,
  diskUsage: 74,
  alertCount: 4,
  criticalAlertCount: 1,
  warningAlertCount: 2,
  capabilities: [
    'DEVICE_CORE', 'DEVICE_HARDWARE', 'DEVICE_NETWORK', 'DEVICE_OS',
    'DEVICE_SECURITY', 'DEVICE_DISKS', 'DEVICE_SOFTWARE', 'DEVICE_METRICS', 'DEVICE_ALERTS'
  ],
  providerMappings: [{
    providerConnectionId: 'preview-conn-01',
    providerName: 'Zabbix',
    providerDisplayName: 'Zabbix — Production Monitoring',
    providerType: 'ZABBIX',
    externalResourceId: 'zabbix-host-10025',
    syncStatus: 'OK',
    lastSyncedAt: new Date().toISOString()
  }],
  hardware: {
    manufacturer: 'Dell Inc.',
    model: 'OptiPlex 7090',
    serialNumber: 'DLLXXX123456',
    processor: 'Intel Core i7-11700 @ 2.50GHz',
    processorCores: 8,
    memoryTotalBytes: 17179869184, // 16 GB
    motherboard: 'Dell 0MWYPT',
    biosManufacturer: 'Dell Inc.',
    biosVersion: '1.12.0',
    biosDate: '2023-05-10'
  },
  network: {
    privateIp: '192.168.10.25',
    publicIp: '203.0.113.25',
    macAddresses: ['00:1A:2B:3C:4D:5E'],
    domain: 'corp.example.local',
    workgroup: null,
    dnsServers: ['192.168.10.1', '8.8.8.8']
  },
  os: {
    name: 'Windows 11 Pro',
    edition: 'Professional',
    version: '10.0.22621',
    build: '22621.3155',
    architecture: 'x64',
    installDate: '2023-01-15',
    licenseStatus: null
  },
  security: {
    antivirus: 'Windows Defender',
    antivirusStatus: 'ACTIVE',
    antivirusDefinitionDate: '2024-07-10',
    firewall: 'Windows Firewall',
    firewallStatus: 'ENABLED',
    encryption: 'BitLocker',
    encryptionStatus: 'ENABLED',
    secureBoot: true
  },
  disks: [
    {
      name: 'Local Disk',
      drive: 'C:',
      type: 'SSD',
      model: 'Samsung 870 EVO',
      serialNumber: 'S5XXNX0R500000',
      totalCapacityBytes: 499963174912,
      usedCapacityBytes: 369975476224,
      freeCapacityBytes: 129987698688,
      usagePercentage: 74,
      encryptionStatus: 'BitLocker On',
      healthStatus: 'Healthy'
    },
    {
      name: 'Data Drive',
      drive: 'D:',
      type: 'HDD',
      model: 'WD Blue 2TB',
      serialNumber: 'WD-WXXXXXXXXXX',
      totalCapacityBytes: 2000398934016,
      usedCapacityBytes: 800000000000,
      freeCapacityBytes: 1200398934016,
      usagePercentage: 40,
      encryptionStatus: null,
      healthStatus: 'Healthy'
    }
  ],
  software: [
    { name: 'Microsoft Office 365', version: '16.0.17231', publisher: 'Microsoft Corporation', installDate: '2023-02-01', architecture: 'x64' },
    { name: 'Google Chrome', version: '124.0.6367', publisher: 'Google LLC', installDate: '2024-05-15', architecture: 'x64' },
    { name: 'Zabbix Agent 2', version: '6.4.0', publisher: 'Zabbix LLC', installDate: '2023-03-10', architecture: 'x64' },
    { name: '7-Zip 23.01', version: '23.01', publisher: 'Igor Pavlov', installDate: '2024-01-20', architecture: 'x64' },
    { name: 'VLC media player', version: '3.0.20', publisher: 'VideoLAN', installDate: '2023-07-11', architecture: 'x86' },
    { name: 'Notepad++', version: '8.6.4', publisher: 'Notepad++ Team', installDate: '2024-02-10', architecture: 'x64' },
    { name: 'WinRAR 6.24', version: '6.24.0', publisher: 'win.rar GmbH', installDate: '2024-03-01', architecture: 'x64' }
  ],
  activityEvents: [
    { timestamp: new Date().toISOString(), eventType: 'SYNC', actor: 'Zabbix', description: 'Device synchronized from Zabbix — data refreshed.' },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), eventType: 'ALERT_CREATED', actor: 'Zabbix', description: 'Critical alert created: High CPU threshold exceeded.' },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), eventType: 'MAPPING_CREATED', actor: 'System', description: 'Provider resource mapping created for Zabbix host zabbix-host-10025.' },
    { timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), eventType: 'DEVICE_DISCOVERED', actor: 'System', description: 'Device discovered and imported from Zabbix.' }
  ]
};

export const FULL_DEVICE_MOCK_ALERTS: any[] = [
  { id: 'a1', severity: 'CRITICAL', name: 'High CPU threshold exceeded', status: 'OPEN', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date().toISOString(), source: 'Zabbix' },
  { id: 'a2', severity: 'WARNING', name: 'Disk usage above 70% on C:', status: 'OPEN', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), source: 'Zabbix' },
  { id: 'a3', severity: 'WARNING', name: 'Windows update pending — 3 updates available', status: 'OPEN', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(), source: 'Zabbix' },
  { id: 'a4', severity: 'INFORMATION', name: 'Agent heartbeat received', status: 'CLOSED', createdAt: new Date(Date.now() - 600000).toISOString(), updatedAt: new Date().toISOString(), source: 'Zabbix' }
];

export const FULL_DEVICE_MOCK_TICKETS: any[] = [
  { id: 't1', ticketNumber: 'INC-1024', title: 'Windows workstation performance issue', priority: 'HIGH', status: 'OPEN', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 't2', ticketNumber: 'REQ-1041', title: 'Install security software', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() }
];
