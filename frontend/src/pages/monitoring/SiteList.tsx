import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Site } from '../../types/monitoring';
import CreateSiteModal from './components/CreateSiteModal';

const SiteList = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSites = useCallback(() => {
    setLoading(true);
    let url = '/monitoring/sites';
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    api.get(url)
      .then(res => setSites(res.data.content || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const confirmDelete = (site: Site) => {
    setDeletingSite(site);
  };

  const handleDelete = async () => {
    if (!deletingSite) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/monitoring/sites/${deletingSite.id}`);
      fetchSites();
      setDeletingSite(null);
    } catch (err) {
      console.error('Failed to delete site', err);
      alert('Failed to delete site. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sites</h1>
        <div className="flex space-x-4">
          <select 
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            + Add Site
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Devices</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Providers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="text-gray-500 mb-4">No sites found.</div>
                      <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Create your first site &rarr;
                      </button>
                    </td>
                  </tr>
                ) : (
                  sites.map(site => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/sites/${site.id}`}>{site.name}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{site.identifier || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {[site.city, site.country].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="font-medium text-gray-900">{site.deviceCount}</div>
                        <div className="text-xs text-gray-500">{site.onlineDeviceCount} online</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {site.openAlertCount > 0 ? (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                             {site.openAlertCount}
                           </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {site.providerMappings?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${site.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {site.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => confirmDelete(site)}
                          disabled={deletingSite?.id === site.id}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          {deletingSite?.id === site.id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <CreateSiteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSiteCreated={fetchSites} 
      />

      {deletingSite && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setDeletingSite(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Site "{deletingSite.name}"
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete this site? All associated connections and mappings will be impacted.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Dependent Resources</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex justify-between"><span>Devices:</span> <span className="font-semibold">{deletingSite.deviceCount}</span></li>
                          <li className="flex justify-between"><span>Active Alerts:</span> <span className="font-semibold">{deletingSite.openAlertCount}</span></li>
                          <li className="flex justify-between"><span>Provider Connections:</span> <span className="font-semibold">{deletingSite.providerMappings?.length || 0}</span></li>
                        </ul>
                      </div>
                      <p className="text-xs text-red-600 mt-4 font-medium">
                        This action cannot be undone. Please ensure you have safely re-assigned or cleared the above resources before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Site'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setDeletingSite(null)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteList;
