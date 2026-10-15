import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { SyncDevicesModal } from './components/SyncDevicesModal';
import { RefreshCw, Plus, ChevronDown } from 'lucide-react';
import { ENABLE_DEVICE_UI_MOCK, mockDeviceData } from './mockDeviceData';

const DeviceList = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [syncStatusFilter, setSyncStatusFilter] = useState('');
  
  const [sites, setSites] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const fetchDevices = () => {
    setLoading(true);
    api.get('/monitoring/devices')
      .then(res => {
        let fetchedDevices = res.data.content || res.data;
        if (ENABLE_DEVICE_UI_MOCK) {
          fetchedDevices = [mockDeviceData, ...fetchedDevices];
        }
        setDevices(fetchedDevices);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchFilters = () => {
    api.get('/monitoring/sites')
      .then(res => setSites(res.data.content || res.data))
      .catch(err => console.error(err));
      
    // The backend does not currently have an integration connections endpoint exposed for this.
    // Setting an empty array to avoid 404 runtime errors.
    setProviders([]);
  };

  useEffect(() => {
    fetchDevices();
    fetchFilters();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filteredDevices = devices.filter(device => {
    if (search && !device.hostname.toLowerCase().includes(search.toLowerCase()) && !(device.ipAddress && device.ipAddress.includes(search))) return false;
    if (statusFilter && device.status !== statusFilter) return false;
    if (siteFilter && device.siteId !== siteFilter) return false;
    if (providerFilter && (!device.providerMappings || !device.providerMappings.some((m:any) => m.providerConnectionId === providerFilter))) return false;
    if (syncStatusFilter && (!device.providerMappings || !device.providerMappings.some((m:any) => m.syncStatus === syncStatusFilter))) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Devices</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-md text-sm border border-indigo-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Devices
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Device
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {isAddMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                <button 
                  onClick={() => { setIsAddMenuOpen(false); setIsSyncModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-gray-400" />
                  Sync from Provider
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  Manual device creation is not available. Devices originate from connected providers.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by hostname or IP..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
          >
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
        
        <div className="w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={providerFilter}
            onChange={e => setProviderFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.providerName}</option>
            ))}
          </select>
        </div>
        
        <div className="w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="WARNING">Warning</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>
        
        <div className="w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={syncStatusFilter}
            onChange={e => setSyncStatusFilter(e.target.value)}
          >
            <option value="">All Sync Status</option>
            <option value="OK">OK</option>
            <option value="ERROR">Error</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU / Mem / Disk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.length === 0 && devices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <h2 className="text-xl font-medium text-gray-900 mb-2">No devices yet</h2>
                    <p className="text-gray-500 mb-6">Your connected providers have not synchronized any devices into MSP Portal.</p>
                    <div className="flex justify-center space-x-4">
                      <button 
                        onClick={() => setIsSyncModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded-md shadow-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync from Provider
                      </button>
                      <Link to="/settings/providers" className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md shadow-sm transition-colors">
                        View Providers
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                    No devices match the current filters.
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link to={`/devices/${device.id}`}>{device.hostname}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${device.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 
                          device.status === 'OFFLINE' ? 'bg-gray-100 text-gray-800' : 
                          device.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                        {device.status === 'ONLINE' ? '🟢 ' : device.status === 'OFFLINE' ? '🔴 ' : device.status === 'WARNING' ? '🟡 ' : '⚪ '}{device.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {device.siteName || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {device.deviceType || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {device.ipAddress || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {device.alertCount > 0 ? (
                         <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">{device.alertCount} Alerts</span>
                      ) : (
                         <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2 text-xs">
                        <span title="CPU">{device.cpuUsage != null ? `${device.cpuUsage.toFixed(1)}%` : '—'}</span>
                        <span className="text-gray-300">|</span>
                        <span title="Memory">{device.memoryUsage != null ? `${device.memoryUsage.toFixed(1)}%` : '—'}</span>
                        <span className="text-gray-300">|</span>
                        <span title="Disk">{device.diskUsage != null ? `${device.diskUsage.toFixed(1)}%` : '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {device.providerMappings && device.providerMappings.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {device.providerMappings.map((m: any) => (
                            <div key={m.providerConnectionId} className="flex flex-col">
                              <span className="text-xs font-medium text-slate-700">
                                {m.providerDisplayName || m.providerName}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={`Resource: ${m.externalResourceId}`}>
                                ID: {m.externalResourceId}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {device.providerMappings && device.providerMappings.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {device.providerMappings.map((m: any) => (
                            <span key={m.providerConnectionId} className={`px-2 py-1 text-[10px] leading-3 font-semibold rounded-full w-fit ${
                              m.syncStatus === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                              m.syncStatus === 'ERROR' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {m.syncStatus}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <SyncDevicesModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        onComplete={() => fetchDevices()} 
      />
    </div>
  );
};

export default DeviceList;
