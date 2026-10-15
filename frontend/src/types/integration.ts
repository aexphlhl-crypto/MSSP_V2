export interface DiscoveredResource {
  externalId: string;
  name: string;
  type: string;
  rawProperties: Record<string, any>;
}

export interface ProviderResourceMapping {
  id: string;
  tenantId: string;
  providerConnection: {
    id: string;
    providerName: string;
    providerType: string;
    displayName: string;
  };
  resourceType: 'SITE' | 'DEVICE' | 'ALERT';
  externalResourceId: string;
  externalParentId?: string;
  internalResourceId: string;
  syncStatus: 'PENDING' | 'SYNCED' | 'ERROR';
  lastSyncedAt?: string;
}

export interface CreateMappingPayload {
  providerConnectionId: string;
  resourceType: 'SITE' | 'DEVICE' | 'ALERT';
  externalResourceId: string;
  externalParentId?: string;
  internalResourceId: string;
}
