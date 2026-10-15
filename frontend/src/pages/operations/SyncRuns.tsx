import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SyncRun {
  id: string;
  providerId: string;
  providerName: string;
  startTime: string;
  durationMs: number;
  objectsFetched: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  errorTrace?: string;
}

const SyncRuns = () => {
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncRuns();
  }, []);

  const fetchSyncRuns = async () => {
    try {
      const response = await api.get('/operations/sync-runs');
      setSyncRuns(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sync runs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-full space-y-6">
      <h1 className="text-2xl font-bold">Sync Runs Troubleshooting</h1>
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Recent Sync Runs</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (ms)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objects Fetched</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{run.providerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${run.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                          run.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(run.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{run.durationMs}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{run.objectsFetched}</td>
                    <td className="px-6 py-4 text-sm">
                      {run.errorTrace && (
                        <details className="cursor-pointer">
                          <summary className="text-indigo-600 hover:text-indigo-900">View Trace</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-xs">{run.errorTrace}</pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncRuns;
