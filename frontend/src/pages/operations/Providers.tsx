import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Provider {
  id: string;
  name: string;
  type: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  lastSyncTime: string;
  errorTrace?: string;
}

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/operations/providers');
      setProviders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-full space-y-6">
      <h1 className="text-2xl font-bold">Provider Reliability Center</h1>
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Providers Status</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map(provider => (
              <div key={provider.id} className="p-4 border rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${provider.status === 'ONLINE' ? 'bg-green-100 text-green-800' : 
                      provider.status === 'OFFLINE' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {provider.status}
                  </span>
                </div>
                <div className="mt-4 text-sm">
                  <p><strong>Last Sync:</strong> {provider.lastSyncTime}</p>
                  {provider.status === 'ERROR' && provider.errorTrace && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded overflow-auto max-h-32">
                      <strong>Error Trace:</strong><br/>
                      <pre>{provider.errorTrace}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Providers;
