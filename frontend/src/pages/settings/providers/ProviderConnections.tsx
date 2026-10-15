import React, { useEffect, useState } from 'react';
import { 
  Plus, Settings, RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  Trash2, Play, Power, Edit3, Key, Shield, ShieldCheck, Database, Monitor, ExternalLink
} from 'lucide-react';
import { api } from '../../../api/axios';

interface ProviderConnection {
  id: string;
  providerType: 'BACKUP' | 'MONITORING' | 'SECURITY';
  providerName: string;
  displayName?: string;
  baseUrl: string;
  authenticationType: string;
  status: 'CONNECTED' | 'READY_FOR_CREDENTIALS' | 'CONNECTION_FAILED' | 'ERROR' | 'NOT_CONFIGURED';
  enabled: boolean;
  capabilities: string[];
  lastSyncAt?: string;
  lastSuccessfulSyncAt?: string;
  lastError?: string;
  createdAt: string;
  credentialConfigured: boolean;
}

const PROVIDER_METADATA: Record<string, {
  displayName: string;
  type: 'BACKUP' | 'MONITORING' | 'SECURITY';
  authType: 'USERNAME_PASSWORD' | 'API_KEY' | 'TOKEN' | 'BASIC_AUTH';
  fields: { name: string; label: string; type: string; required: boolean }[];
  capabilities: string[];
}> = {
  ZABBIX: {
    displayName: 'Zabbix',
    type: 'MONITORING',
    authType: 'USERNAME_PASSWORD',
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    capabilities: ['DEVICE_CORE', 'DEVICE_METRICS', 'DEVICE_ALERTS', 'DISCOVER_DEVICES']
  },
  COMMVAULT: {
    displayName: 'Commvault',
    type: 'BACKUP',
    authType: 'USERNAME_PASSWORD',
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    capabilities: ['BACKUP_JOBS']
  },
  COUNTERCRAFT: {
    displayName: 'CounterCraft',
    type: 'SECURITY',
    authType: 'API_KEY',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    capabilities: ['SECURITY_EVENTS']
  },
  WAZUH: {
    displayName: 'Wazuh',
    type: 'SECURITY',
    authType: 'USERNAME_PASSWORD',
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    capabilities: ['SECURITY_EVENTS', 'VULNERABILITY']
  }
};

interface Site {
  id: string;
  name: string;
  code?: string;
}

const ProviderConnections = () => {
  const [providers, setProviders] = useState<ProviderConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderConnection | null>(null);
  const [editingProvider, setEditingProvider] = useState<ProviderConnection | null>(null);

  // Form states
  const [selectedNameKey, setSelectedNameKey] = useState('ZABBIX');
  const [displayName, setDisplayName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; status: string; error?: string } | null>(null);

  // Sync states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [syncStep, setSyncStep] = useState<'select_site' | 'discovering' | 'importing' | 'success' | 'error'>('select_site');
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers');
      setProviders(res.data);
      if (res.data.length > 0 && !selectedProvider) {
        setSelectedProvider(res.data[0]);
      }
    } catch (e) {
      console.error('Failed to load provider connections', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const meta = PROVIDER_METADATA[selectedNameKey];
    
    // Construct credential values
    let credentialSecret = '';
    if (meta.authType === 'USERNAME_PASSWORD') {
      credentialSecret = `${credentialValues.username || ''}:${credentialValues.password || ''}`;
    } else if (meta.authType === 'API_KEY') {
      credentialSecret = credentialValues.apiKey || '';
    }

    const payload = {
      providerType: meta.type,
      providerName: selectedNameKey,
      displayName: displayName || meta.displayName,
      baseUrl,
      authenticationType: meta.authType,
      capabilities: meta.capabilities,
      credentialSecret
    };

    try {
      const res = await api.post('/providers', payload);
      setProviders([...providers, res.data]);
      setSelectedProvider(res.data);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      alert('Failed to save connection. Please verify configurations.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    const meta = PROVIDER_METADATA[editingProvider.providerName];
    
    let credentialSecret = '';
    if (meta.authType === 'USERNAME_PASSWORD') {
      // Only set credentialSecret if password is changed/supplied
      if (credentialValues.password) {
        credentialSecret = `${credentialValues.username || ''}:${credentialValues.password || ''}`;
      }
    } else if (meta.authType === 'API_KEY') {
      if (credentialValues.apiKey) {
        credentialSecret = credentialValues.apiKey || '';
      }
    }

    const payload = {
      providerType: editingProvider.providerType,
      providerName: editingProvider.providerName,
      displayName: displayName || editingProvider.displayName,
      baseUrl,
      authenticationType: editingProvider.authenticationType,
      enabled: editingProvider.enabled,
      capabilities: meta.capabilities,
      credentialSecret: credentialSecret || undefined
    };

    try {
      const res = await api.put(`/providers/${editingProvider.id}`, payload);
      setProviders(providers.map(p => p.id === editingProvider.id ? res.data : p));
      setSelectedProvider(res.data);
      setEditingProvider(null);
      resetForm();
    } catch (err) {
      alert('Failed to update provider configuration.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider connection?')) return;
    try {
      await api.delete(`/providers/${id}`);
      const updated = providers.filter(p => p.id !== id);
      setProviders(updated);
      setSelectedProvider(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      alert('Failed to delete provider.');
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingConnectionId(id);
    setTestResult(null);
    try {
      const res = await api.post(`/providers/${id}/test`);
      setTestResult({ id, status: res.data.status });
      // Update provider status in-place
      setProviders(providers.map(p => p.id === id ? { ...p, status: res.data.status } : p));
      if (selectedProvider?.id === id) {
        setSelectedProvider(prev => prev ? { ...prev, status: res.data.status } : null);
      }
    } catch (err) {
      setTestResult({ id, status: 'CONNECTION_FAILED', error: 'Authentication timeout or server unreachable.' });
    } finally {
      setTestingConnectionId(null);
    }
  };

  const handleSyncNow = async (id: string) => {
    setSyncingProviderId(id);
    setSelectedSiteId('');
    setSyncStep('select_site');
    setSyncError('');
    setDiscoveredCount(0);
    setShowSyncModal(true);
    
    // Fetch sites
    try {
      const res = await api.get('/monitoring/sites');
      const fetchedSites = res.data.content || res.data || [];
      setSites(fetchedSites);
      if (fetchedSites.length > 0) {
        setSelectedSiteId(fetchedSites[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch sites', err);
    }
  };

  const executeSync = async () => {
    if (!syncingProviderId || !selectedSiteId) return;
    
    try {
      // Step 1: Discover
      setSyncStep('discovering');
      const discoverRes = await api.get(`/providers/${syncingProviderId}/discover/DEVICE`);
      const resources = discoverRes.data || [];
      setDiscoveredCount(resources.length);
      
      if (resources.length === 0) {
        setSyncStep('success');
        return;
      }
      
      // Step 2: Import
      setSyncStep('importing');
      await api.post('/monitoring/devices/import', {
        providerConnectionId: syncingProviderId,
        siteId: selectedSiteId,
        resources: resources
      });
      
      setSyncStep('success');
    } catch (err: any) {
      console.error('Resource sync failed', err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || 'Sync failed due to server error or network timeout.');
      setSyncError(errMsg);
      setSyncStep('error');
    }
  };

  const startEdit = (p: ProviderConnection) => {
    setEditingProvider(p);
    setDisplayName(p.displayName || '');
    setBaseUrl(p.baseUrl || '');
    
    // Parse username ifUSERNAME_PASSWORD to prepopulate username field
    const defaultUser = p.authenticationType === 'USERNAME_PASSWORD' ? 'Admin' : '';
    setCredentialValues({ username: defaultUser, password: '' });
  };

  const resetForm = () => {
    setDisplayName('');
    setBaseUrl('');
    setCredentialValues({});
  };

  const selectProviderMeta = PROVIDER_METADATA[selectedNameKey];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Title section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provider Connections</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure, manage, and test integrations for backup repositories, security systems, and monitoring agents.
          </p>
        </div>
        <button 
          onClick={() => { setShowAddForm(true); resetForm(); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center shadow-sm text-sm"
        >
          <Plus className="h-4.5 w-4.5 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Forms Area */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Provider</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Provider Type</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 text-sm font-semibold"
                  value={selectedNameKey}
                  onChange={(e) => { setSelectedNameKey(e.target.value); resetForm(); }}
                  required
                >
                  {Object.keys(PROVIDER_METADATA).map(k => (
                    <option key={k} value={k}>{PROVIDER_METADATA[k].displayName} ({PROVIDER_METADATA[k].type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Display Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={selectProviderMeta.displayName + " Main"}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">API Base URL</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://commvault-hostname/SearchSvc/CVWebService.svc"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  required
                />
              </div>

              {/* Dynamic authentication fields */}
              {selectProviderMeta.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </label>
                  <input 
                    type={field.type} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-850 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={credentialValues[field.name] || ''}
                    onChange={(e) => setCredentialValues({ ...credentialValues, [field.name]: e.target.value })}
                    required={field.required}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm shadow-sm"
              >
                Save Connection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingProvider && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Edit Configuration: {editingProvider.displayName || editingProvider.providerName}</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Display Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 text-sm outline-none"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">API Base URL</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 text-sm outline-none"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  required
                />
              </div>

              {/* Dynamic authentication fields */}
              {PROVIDER_METADATA[editingProvider.providerName]?.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {field.label} {field.type === 'password' && '(Leave empty to keep existing)'}
                  </label>
                  <input 
                    type={field.type} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-850 text-sm outline-none"
                    placeholder={field.type === 'password' && editingProvider.credentialConfigured ? 'Configured' : ''}
                    value={credentialValues[field.name] || ''}
                    onChange={(e) => setCredentialValues({ ...credentialValues, [field.name]: e.target.value })}
                    required={field.type !== 'password' && field.required}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button" 
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm shadow-sm"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main List and details block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {providers.map((p) => {
                  const isSelected = selectedProvider?.id === p.id;
                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50 border-l-4 border-indigo-600' : ''}`}
                      onClick={() => setSelectedProvider(p)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-800 block">{p.displayName || p.providerName}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">{p.baseUrl}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">
                        {p.providerType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          p.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          p.status === 'READY_FOR_CREDENTIALS' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          p.status === 'CONNECTION_FAILED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {p.status === 'CONNECTED' ? <CheckCircle className="w-2.5 h-2.5 mr-1" /> : <XCircle className="w-2.5 h-2.5 mr-1" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleTestConnection(p.id)}
                          disabled={testingConnectionId === p.id}
                          className="text-indigo-600 hover:text-indigo-800 font-bold mr-3"
                        >
                          {testingConnectionId === p.id ? 'Testing...' : 'Test'}
                        </button>
                        <button 
                          onClick={() => startEdit(p)}
                          className="text-slate-500 hover:text-slate-750 font-bold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {providers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                      No provider integrations configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details card column */}
        <div className="lg:col-span-1">
          {selectedProvider ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedProvider.displayName || selectedProvider.providerName}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">Connection ID: {selectedProvider.id.substring(0, 8)}</span>
                </div>
                <button 
                  onClick={() => handleDelete(selectedProvider.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Connection"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Status and summary */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Connection Status:</span>
                  <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedProvider.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProvider.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
                  <span>Authentication Type:</span>
                  <span className="font-bold text-slate-800">{selectedProvider.authenticationType}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
                  <span>Credentials Status:</span>
                  <span className="flex items-center text-slate-800">
                    <Key className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {selectedProvider.credentialConfigured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* API and URL Details */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endpoint Configuration</span>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-700 select-all whitespace-nowrap">{selectedProvider.baseUrl}</span>
                </div>
              </div>

              {/* Capabilities list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Declared Provider Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProvider.capabilities?.map(cap => (
                    <span key={cap} className="px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {cap}
                    </span>
                  ))}
                  {(!selectedProvider.capabilities || selectedProvider.capabilities.length === 0) && (
                    <span className="text-xs text-slate-400">No capabilities enabled.</span>
                  )}
                </div>
              </div>

              {/* Connection test triggers */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleTestConnection(selectedProvider.id)}
                  disabled={testingConnectionId === selectedProvider.id}
                  className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-750 font-bold rounded-lg text-xs flex items-center justify-center transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingConnectionId === selectedProvider.id ? 'animate-spin' : ''}`} />
                  Test Health
                </button>
                <button
                  onClick={() => handleSyncNow(selectedProvider.id)}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Sync Resources
                </button>
              </div>

              {/* Test Connection feedback banner */}
              {testResult && testResult.id === selectedProvider.id && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                  testResult.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-red-50 text-red-800 border-red-250'
                }`}>
                  {testResult.status === 'CONNECTED' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-emerald-900">Success!</span>
                        Zabbix agent verified, session token cached securely in memory.
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-red-900">Connection Failed</span>
                        {testResult.error || 'Unauthorized credentials or invalid URL configuration.'}
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold h-full flex items-center justify-center">
              Select a provider to view details.
            </div>
          )}
        </div>

      </div>

      {/* Resource Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-40 transition-opacity" onClick={() => setShowSyncModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 sm:mx-0 sm:h-10 sm:w-10">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                      Sync Resources from Zabbix
                    </h3>
                    
                    {syncStep === 'select_site' && (
                      <div className="mt-4 space-y-4">
                        <p className="text-sm text-slate-500">
                          Select the target Site to associate the discovered devices with:
                        </p>
                        {sites.length === 0 ? (
                          <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              No Sites found. You need to create a Site in the Sites menu before importing devices.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider">Target Site</label>
                            <select
                              value={selectedSiteId}
                              onChange={(e) => setSelectedSiteId(e.target.value)}
                              className="w-full rounded-lg border border-slate-250 p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              {sites.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {syncStep === 'discovering' && (
                      <div className="mt-6 text-center py-6 space-y-3">
                        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-sm font-bold text-slate-800">Discovering resources...</p>
                        <p className="text-xs text-slate-550">Fetching configured hosts and metrics from Zabbix API.</p>
                      </div>
                    )}

                    {syncStep === 'importing' && (
                      <div className="mt-6 text-center py-6 space-y-3">
                        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-sm font-bold text-slate-800">Importing discovered resources...</p>
                        <p className="text-xs text-slate-550">
                          Mapping {discoveredCount} Zabbix hosts to Devices.
                        </p>
                      </div>
                    )}

                    {syncStep === 'success' && (
                      <div className="mt-6 text-center py-6 space-y-3">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                        <p className="text-sm font-bold text-emerald-900">Sync Complete!</p>
                        <p className="text-xs text-slate-550">
                          Successfully imported {discoveredCount} devices from Zabbix connection into your Operational Workspace.
                        </p>
                      </div>
                    )}

                    {syncStep === 'error' && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                          <XCircle className="w-5 h-5 shrink-0" />
                          <span>Sync Failed</span>
                        </div>
                        <p className="text-xs text-rose-750 bg-rose-50 border border-rose-200 p-3 rounded-lg font-semibold leading-relaxed">
                          {syncError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100 gap-2">
                {syncStep === 'select_site' && (
                  <button
                    type="button"
                    onClick={executeSync}
                    disabled={!selectedSiteId}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white focus:outline-none sm:w-auto"
                  >
                    Start Sync
                  </button>
                )}
                {syncStep === 'success' && (
                  <button
                    type="button"
                    onClick={() => { setShowSyncModal(false); window.location.href = '/devices'; }}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white focus:outline-none sm:w-auto"
                  >
                    Go to Devices
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-200 shadow-sm px-4 py-2 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:w-auto"
                >
                  {syncStep === 'success' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderConnections;
