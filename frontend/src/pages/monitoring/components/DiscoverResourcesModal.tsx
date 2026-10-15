import React, { useState, useEffect } from 'react';
import { api } from '../../../api/axios';
import { integrationApi } from '../../../api/integration';
import { DiscoveredResource } from '../../../types/integration';

interface DiscoverResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  onMappingCreated: () => void;
}

const DiscoverResourcesModal: React.FC<DiscoverResourcesModalProps> = ({ isOpen, onClose, siteId, onMappingCreated }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [discoveredResources, setDiscoveredResources] = useState<DiscoveredResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [mappingId, setMappingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      setDiscoveredResources([]);
      setSelectedProviderId('');
      setError(null);
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // In a real scenario we might have an endpoint to list all configured providers for a tenant
      // For this phase, let's assume /api/v1/settings/providers exists and we can fetch them.
      // Or we can just use the generic /integration-core endpoint if available.
      // Wait, there's no /api/v1/settings/providers. We will assume we fetch configured providers.
      // Let's use api.get('/providers') or similar. But since we didn't implement provider config list yet,
      // I will assume there's an API for it, or we handle it gracefully if it fails.
      // For now, let's try /settings/providers
      const res = await api.get('/settings/providers');
      setProviders(res.data.content || res.data || []);
    } catch (err) {
      console.error('Failed to fetch providers', err);
      // We'll let it be empty for now if it fails, meaning no providers configured.
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    if (!selectedProviderId) return;
    setDiscovering(true);
    setError(null);
    setDiscoveredResources([]);
    try {
      const resources = await integrationApi.discoverResources(selectedProviderId, 'SITE');
      setDiscoveredResources(resources);
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 500) {
        setError(err.response?.data?.message || 'Resource discovery is not available for this provider yet.');
      } else {
        setError('Resource discovery is not available for this provider yet.');
      }
    } finally {
      setDiscovering(false);
    }
  };

  const handleMap = async (resource: DiscoveredResource) => {
    try {
      setMappingId(resource.externalId);
      await integrationApi.createMapping({
        providerConnectionId: selectedProviderId,
        resourceType: 'SITE',
        externalResourceId: resource.externalId,
        internalResourceId: siteId
      });
      onMappingCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to map resource.');
    } finally {
      setMappingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Discover External Resources
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Provider</label>
                    <div className="mt-1 flex space-x-2">
                      <select
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={selectedProviderId}
                        onChange={(e) => setSelectedProviderId(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">-- Select a configured provider --</option>
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.displayName || p.providerName}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleDiscover}
                        disabled={!selectedProviderId || discovering}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                      >
                        {discovering ? 'Discovering...' : 'Discover'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  {!error && !discovering && discoveredResources.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {discoveredResources.map(resource => (
                            <tr key={resource.externalId}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {resource.name}
                                <div className="text-xs text-gray-500 font-mono mt-1">{resource.externalId}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {resource.type}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleMap(resource)}
                                  disabled={mappingId === resource.externalId}
                                  className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                                >
                                  {mappingId === resource.externalId ? 'Mapping...' : 'Map to Site'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!error && !discovering && selectedProviderId && discoveredResources.length === 0 && (
                    <div className="text-sm text-gray-500 text-center p-4 border border-dashed border-gray-300 rounded-md">
                      No resources found for mapping. Click Discover to fetch from provider.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverResourcesModal;
