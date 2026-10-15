export const ENABLE_DEVICE_UI_MOCK = true;

export const mockDeviceData = {
  id: 'mock-device-001',
  hostname: 'WIN-MSP-001',
  status: 'ONLINE',
  siteName: 'Hanoi Head Office',
  deviceType: 'PC',
  operatingSystem: 'Windows 11 Pro',
  ipAddress: '192.168.10.25',
  publicIp: '203.0.113.25',
  lastSeenAt: new Date().toISOString(),
  cpuUsage: 32,
  memoryUsage: 61,
  diskUsage: 74,
  alertCount: 4,
  providerMappings: [
    {
      providerConnectionId: 'mock-conn-01',
      providerName: 'Zabbix',
      providerDisplayName: 'Zabbix',
      externalResourceId: 'zabbix-host-001',
      syncStatus: 'OK'
    }
  ]
};

export const mockDeviceAlerts = [
  {
    id: 'mock-alert-1',
    severity: 'CRITICAL',
    name: 'High CPU threshold exceeded',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'mock-alert-2',
    severity: 'WARNING',
    name: 'Disk usage above 70%',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-alert-3',
    severity: 'WARNING',
    name: 'Windows update pending',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'mock-alert-4',
    severity: 'INFORMATION',
    name: 'Agent heartbeat received',
    status: 'CLOSED',
    createdAt: new Date().toISOString()
  }
];

export const mockDeviceTickets = [
  {
    id: 'mock-ticket-1',
    ticketNumber: 'INC-1024',
    title: 'Windows workstation performance issue',
    priority: 'HIGH',
    status: 'OPEN'
  },
  {
    id: 'mock-ticket-2',
    ticketNumber: 'REQ-1041',
    title: 'Install security software',
    priority: 'MEDIUM',
    status: 'IN PROGRESS'
  }
];
