import React, { useState, useEffect } from 'react';
import { api } from '../../../api/axios';
import { X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SyncDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Provider {
  id: string;
  providerName: string;
  providerType: string;
  status: string;
  capabilities: string[];
}

interface DiscoveredResource {
  externalId: string;
  name: string;
  type: string;
  rawProperties?: any;
}

interface Site {
  id: string;
  name: string;
}

export const SyncDevicesModal: React.FC<SyncDevicesModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredResources, setDiscoveredResources] = useState<DiscoveredResource[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    newlyCreated: number;
    updated: number;
    alreadyImported: number;
    failed: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset();
      fetchProviders();
    }
  }, [isOpen]);

  const reset = () => {
    setStep(1);
    setSelectedProvider(null);
    setDiscoveredResources([]);
    setSelectedResources(new Set());
    setSelectedSiteId('');
    setImportResult(null);
    setError(null);
  };

  const fetchProviders = async () => {
    try {
      // The backend does not currently have an integration connections endpoint exposed.
      // Setting an empty array to avoid 404 runtime errors.
      setProviders([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load providers.');
    }
  };

  const handleDiscover = async (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDiscovering(true);
    setError(null);
    setStep(2);
    try {
      const response = await api.get(`/api/v1/providers/${provider.id}/discover/DEVICE`);
      const resources = response.data || [];
      setDiscoveredResources(resources);
      setSelectedResources(new Set(resources.map((r: DiscoveredResource) => r.externalId)));
      
      const sitesResponse = await api.get('/api/v1/monitoring/sites');
      setSites(sitesResponse.data || []);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Discovery failed or provider is unavailable.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleImport = async () => {
    if (!selectedProvider) return;
    setIsImporting(true);
    setError(null);
    
    try {
      const resourcesToImport = discoveredResources.filter(r => selectedResources.has(r.externalId));
      
      const payload = {
        providerConnectionId: selectedProvider.id,
        siteId: selectedSiteId || null,
        resources: resourcesToImport
      };
      
      const response = await api.post('/monitoring/devices/import', payload);
      setImportResult(response.data);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed. See backend logs.');
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-indigo-600" />
            Sync Devices
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-100 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-gray-600 mb-6">Discover devices from your connected monitoring and management providers.</p>
              
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Provider</h3>
              {providers.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-2">No connected providers support device discovery.</p>
                  <p className="text-sm text-gray-400">Connect a monitoring provider before synchronizing devices.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {providers.map(provider => (
                    <div 
                      key={provider.id} 
                      onClick={() => handleDiscover(provider)}
                      className="border rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{provider.providerName}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Devices discovered</h3>
                <span className="text-sm text-gray-500">
                  {isDiscovering ? 'Discovering...' : `Found ${discoveredResources.length} devices from ${selectedProvider?.providerName}`}
                </span>
              </div>
              
              {isDiscovering ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : discoveredResources.length === 0 && !error ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500">No devices were discovered from this provider.</p>
                </div>
              ) : (
                <div>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input 
                              type="checkbox" 
                              checked={selectedResources.size === discoveredResources.length && discoveredResources.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedResources(new Set(discoveredResources.map(r => r.externalId)));
                                } else {
                                  setSelectedResources(new Set());
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">DEVICE</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">TYPE</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">IP</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {discoveredResources.map((res) => (
                          <tr key={res.externalId} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input 
                                type="checkbox" 
                                checked={selectedResources.has(res.externalId)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedResources);
                                  if (e.target.checked) newSet.add(res.externalId);
                                  else newSet.delete(res.externalId);
                                  setSelectedResources(newSet);
                                }}
                              />
                            </td>
                            <td className="px-4 py-2 font-medium">{res.name || 'Unknown'}</td>
                            <td className="px-4 py-2 text-gray-500">{res.type || 'Endpoint'}</td>
                            <td className="px-4 py-2 text-gray-500">{res.rawProperties?.ipAddress || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Site Assignment</h3>
              <p className="text-sm text-gray-600 mb-6">Select a Site to assign the imported devices. Devices that already exist will not have their site overwritten.</p>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">[ Unassigned ]</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Import Summary</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-gray-500">Provider:</div>
                  <div className="font-medium">{selectedProvider?.providerName}</div>
                  
                  <div className="text-gray-500">Selected for import:</div>
                  <div className="font-medium">{selectedResources.size}</div>
                  
                  <div className="text-gray-500">Site Assignment:</div>
                  <div className="font-medium">{selectedSiteId ? sites.find(s => s.id === selectedSiteId)?.name : 'Unassigned'}</div>
                </div>
              </div>
              
              {isImporting && (
                <div className="flex flex-col items-center justify-center py-6">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
                  <span className="text-gray-600 font-medium">Synchronizing devices...</span>
                </div>
              )}
            </div>
          )}

          {step === 5 && importResult && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Synchronization complete</h3>
              <p className="text-gray-600 mb-8">{importResult.newlyCreated + importResult.updated + importResult.alreadyImported + importResult.failed} devices processed</p>
              
              <div className="max-w-xs mx-auto text-left space-y-2 text-sm">
                <div className="flex justify-between items-center text-green-700">
                  <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> New devices</span>
                  <span className="font-bold">{importResult.newlyCreated}</span>
                </div>
                <div className="flex justify-between items-center text-blue-700">
                  <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Updated devices</span>
                  <span className="font-bold">{importResult.updated}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Already imported</span>
                  <span className="font-bold">{importResult.alreadyImported}</span>
                </div>
                <div className="flex justify-between items-center text-red-700">
                  <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Failed</span>
                  <span className="font-bold">{importResult.failed}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-between bg-gray-50 rounded-b-lg">
          {step === 1 ? (
            <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 text-gray-700">Cancel</button>
          ) : step === 5 ? (
            <div className="w-full flex justify-end">
              <button 
                onClick={() => { onClose(); onComplete(); }} 
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Devices
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setStep(step - 1 as any)} 
              disabled={isImporting}
              className="px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
            >
              Back
            </button>
          )}

          {step === 2 && (
            <button 
              onClick={() => setStep(3)} 
              disabled={selectedResources.size === 0 || isDiscovering}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              Next
            </button>
          )}
          
          {step === 3 && (
            <button 
              onClick={() => setStep(4)} 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </button>
          )}

          {step === 4 && !isImporting && (
            <button 
              onClick={handleImport} 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Import Devices
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
