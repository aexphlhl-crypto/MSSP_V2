export interface ProviderMappingSummary {
  providerConnectionId: string;
  providerName: string;
  providerDisplayName?: string;
  providerType: 'MONITORING' | 'BACKUP' | 'SECURITY';
  externalResourceId: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'ERROR' | 'STALE';
  lastSyncedAt?: string;
}

export interface Site {
  id: string;
  tenantId: string;
  name: string;
  identifier?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  deviceCount: number;
  onlineDeviceCount: number;
  openAlertCount: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  openTicketCount: number;
  providerMappings: ProviderMappingSummary[];
  createdAt: string;
  updatedAt: string;
}
