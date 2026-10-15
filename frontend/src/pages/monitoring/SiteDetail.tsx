import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Site } from '../../types/monitoring';
import { ProviderResourceMapping } from '../../types/integration';
import { integrationApi } from '../../api/integration';
import EditSiteModal from './components/EditSiteModal';
import DiscoverResourcesModal from './components/DiscoverResourcesModal';

const SiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [mappings, setMappings] = useState<ProviderResourceMapping[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [mappingsLoading, setMappingsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);

  // Device filtering and pagination state
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceStatusFilter, setDeviceStatusFilter] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [devicePage, setDevicePage] = useState(1);
  const devicesPerPage = 5;

  // Alert filtering and pagination state
  const [alertSearch, setAlertSearch] = useState('');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState('');
  const [alertStatusFilter, setAlertStatusFilter] = useState('');
  const [alertPage, setAlertPage] = useState(1);
  const alertsPerPage = 5;

  // Ticket filtering and pagination state
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('');
  const [ticketPage, setTicketPage] = useState(1);
  const ticketsPerPage = 5;

  const fetchSite = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/monitoring/sites/${id}`)
      .then(res => setSite(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchDevices = useCallback(() => {
    if (!id) return;
    setDevicesLoading(true);
    api.get(`/monitoring/devices?siteId=${id}`)
      .then(res => setDevices(res.data.content || res.data))
      .catch(err => console.error(err))
      .finally(() => setDevicesLoading(false));
  }, [id]);

  const fetchAlerts = useCallback(() => {
    if (!id) return;
    setAlertsLoading(true);
    api.get(`/monitoring/alerts?siteId=${id}`)
      .then(res => setAlerts(res.data.content || res.data))
      .catch(err => console.error(err))
      .finally(() => setAlertsLoading(false));
  }, [id]);

  const fetchTickets = useCallback(() => {
    if (!id) return;
    setTicketsLoading(true);
    api.get(`/tickets?siteId=${id}`)
      .then(res => setTickets(res.data.content || res.data))
      .catch(err => console.error(err))
      .finally(() => setTicketsLoading(false));
  }, [id]);

  const fetchMappings = useCallback(() => {
    if (!id) return;
    setMappingsLoading(true);
    integrationApi.getMappingsForResource("SITE", id)
      .then(res => setMappings(res))
      .catch(err => console.error(err))
      .finally(() => setMappingsLoading(false));
  }, [id]);

  const handleUnmap = async (mappingId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this resource?')) return;
    try {
      await integrationApi.deleteMapping(mappingId);
      fetchMappings();
      fetchSite(); // Refresh summary metrics
    } catch (err) {
      console.error(err);
      alert('Failed to disconnect resource.');
    }
  };

  useEffect(() => {
    fetchSite();
    fetchDevices();
    fetchAlerts();
    fetchTickets();
    fetchMappings();
  }, [fetchSite, fetchDevices, fetchAlerts, fetchTickets, fetchMappings]);

  if (loading) return <LoadingSpinner />;
  if (!site) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-xl text-gray-500 mb-4">Site not found</div>
      <button onClick={() => navigate('/sites')} className="text-blue-600 hover:underline">
        &larr; Back to Sites
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-lg border border-slate-200">
        <div className="flex flex-col">
          <div className="flex items-center space-x-4 mb-2">
            <button onClick={() => navigate('/sites')} className="text-gray-500 hover:text-gray-700">
              &larr; Back
            </button>
            <h1 className="text-2xl font-bold text-slate-800">{site.name}</h1>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${site.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
              {site.status}
            </span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500 ml-12">
            <div><span className="font-medium text-gray-700">ID:</span> {site.identifier || '-'}</div>
            <div><span className="font-medium text-gray-700">Location:</span> {[site.address, site.city, site.country].filter(Boolean).join(', ') || '-'}</div>
            <div><span className="font-medium text-gray-700">Timezone:</span> {site.timezone || '-'}</div>
            <div>
              <span className="font-medium text-gray-700">Last Sync:</span>{' '}
              {site.providerMappings && site.providerMappings.length > 0 
                ? (() => {
                    const latest = [...site.providerMappings]
                      .filter(m => m.lastSyncedAt)
                      .sort((a, b) => new Date(b.lastSyncedAt!).getTime() - new Date(a.lastSyncedAt!).getTime())[0];
                    return latest ? new Date(latest.lastSyncedAt!).toLocaleString() : 'Not available';
                  })()
                : 'Not available'}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Edit Site
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Total Devices</span>
          <span className="text-2xl font-bold text-slate-800 mt-1">{site.deviceCount}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center border-b-4 border-b-emerald-500">
          <span className="text-gray-500 text-sm font-medium">Online Devices</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1">{site.onlineDeviceCount}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center border-b-4 border-b-gray-400">
          <span className="text-gray-500 text-sm font-medium">Offline Devices</span>
          <span className="text-2xl font-bold text-gray-600 mt-1">{Math.max(0, site.deviceCount - site.onlineDeviceCount)}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center border-b-4 border-b-red-500">
          <span className="text-gray-500 text-sm font-medium">Critical Alerts</span>
          <span className="text-2xl font-bold text-red-600 mt-1">{site.criticalAlertCount || 0}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center border-b-4 border-b-yellow-500">
          <span className="text-gray-500 text-sm font-medium">Warning Alerts</span>
          <span className="text-2xl font-bold text-yellow-600 mt-1">{site.warningAlertCount || 0}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center border-b-4 border-b-blue-500">
          <span className="text-gray-500 text-sm font-medium">Open Tickets</span>
          <span className="text-2xl font-bold text-blue-600 mt-1">{site.openTicketCount || 0}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Provider Conns</span>
          <span className="text-2xl font-bold text-slate-800 mt-1">{site.providerMappings?.length || 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['OVERVIEW', 'DEVICES', 'ALERTS', 'TICKETS', 'PROVIDERS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview / Site Modules */}
            <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Site Modules (Backend Gaps)</h2>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-dashed border-gray-200">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Backup Data</h3>
                  <p className="text-xs text-gray-500">Backup data is not available at Site level yet. BackupJobs are currently mapped at the Repository level only.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-dashed border-gray-200">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Security Events</h3>
                  <p className="text-xs text-gray-500">Site-level security data is not available yet. SecurityEvents map to Endpoints, not Sites.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-dashed border-gray-200">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Asset Management</h3>
                  <p className="text-xs text-gray-500">Site-level asset management is not currently supported by the backend. UnifiedAssets only map to Tenants.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-dashed border-gray-200">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notes & Attachments</h3>
                  <p className="text-xs text-gray-500">Not supported. There is no generic attachments or notes domain linked to Sites in the backend.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DEVICES' && (
          /* Devices Table */
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">Devices</h2>
              <div className="flex flex-wrap items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search devices..."
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={deviceSearch}
                  onChange={e => { setDeviceSearch(e.target.value); setDevicePage(1); }}
                />
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={deviceStatusFilter}
                  onChange={e => { setDeviceStatusFilter(e.target.value); setDevicePage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={deviceTypeFilter}
                  onChange={e => { setDeviceTypeFilter(e.target.value); setDevicePage(1); }}
                >
                  <option value="">All Types</option>
                  <option value="SERVER">Server</option>
                  <option value="WORKSTATION">Workstation</option>
                  <option value="NETWORK">Network</option>
                  <option value="STORAGE">Storage</option>
                </select>
              </div>
            </div>
            {devicesLoading ? (
              <div className="p-12 flex justify-center"><LoadingSpinner /></div>
            ) : devices.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No devices discovered.</div>
            ) : (
              (() => {
                let filteredDevices = devices.filter(d => {
                  const matchSearch = (d.hostname || '').toLowerCase().includes(deviceSearch.toLowerCase()) || 
                                      (d.ipAddress || '').toLowerCase().includes(deviceSearch.toLowerCase());
                  const matchStatus = deviceStatusFilter ? d.status === deviceStatusFilter : true;
                  const matchType = deviceTypeFilter ? d.deviceType === deviceTypeFilter : true;
                  return matchSearch && matchStatus && matchType;
                });
                
                // Client-side pagination
                const totalPages = Math.ceil(filteredDevices.length / devicesPerPage);
                const currentDevices = filteredDevices.slice((devicePage - 1) * devicesPerPage, devicePage * devicesPerPage);

                return (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostname</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / OS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentDevices.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No matching devices found.</td></tr>
                          ) : currentDevices.map(device => (
                            <tr key={device.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                <Link to={`/devices/${device.id}`}>{device.hostname || device.displayName}</Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{device.deviceType || '-'}</div>
                                <div className="text-xs text-gray-400">{device.operatingSystem || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.ipAddress || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${device.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  {device.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(devicePage - 1) * devicesPerPage + 1}</span> to <span className="font-medium">{Math.min(devicePage * devicesPerPage, filteredDevices.length)}</span> of <span className="font-medium">{filteredDevices.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => setDevicePage(Math.max(1, devicePage - 1))}
                                disabled={devicePage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setDevicePage(Math.min(totalPages, devicePage + 1))}
                                disabled={devicePage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Next
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {activeTab === 'ALERTS' && (
          /* Alerts Table */
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">Active Alerts</h2>
              <div className="flex flex-wrap items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search alerts..."
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={alertSearch}
                  onChange={e => { setAlertSearch(e.target.value); setAlertPage(1); }}
                />
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={alertSeverityFilter}
                  onChange={e => { setAlertSeverityFilter(e.target.value); setAlertPage(1); }}
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                  <option value="INFO">Info</option>
                </select>
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={alertStatusFilter}
                  onChange={e => { setAlertStatusFilter(e.target.value); setAlertPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
            {alertsLoading ? (
              <div className="p-12 flex justify-center"><LoadingSpinner /></div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No active alerts for this Site.</div>
            ) : (
              (() => {
                let filteredAlerts = alerts.filter(a => {
                  const matchSearch = (a.title || '').toLowerCase().includes(alertSearch.toLowerCase());
                  const matchSeverity = alertSeverityFilter ? a.severity === alertSeverityFilter : true;
                  const matchStatus = alertStatusFilter ? a.status === alertStatusFilter : true;
                  return matchSearch && matchSeverity && matchStatus;
                });
                
                // Client-side pagination
                const totalAlertPages = Math.ceil(filteredAlerts.length / alertsPerPage);
                const currentAlerts = filteredAlerts.slice((alertPage - 1) * alertsPerPage, alertPage * alertsPerPage);

                return (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentAlerts.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No matching alerts found.</td></tr>
                          ) : currentAlerts.map(alert => (
                            <tr key={alert.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                   alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                                   alert.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-blue-100 text-blue-800'
                                 }`}>
                                   {alert.severity}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <Link to={`/alerts/${alert.id}`} className="font-medium text-blue-600 truncate max-w-xs block" title={alert.title}>
                                  {alert.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 {new Date(alert.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalAlertPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(alertPage - 1) * alertsPerPage + 1}</span> to <span className="font-medium">{Math.min(alertPage * alertsPerPage, filteredAlerts.length)}</span> of <span className="font-medium">{filteredAlerts.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => setAlertPage(Math.max(1, alertPage - 1))}
                                disabled={alertPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setAlertPage(Math.min(totalAlertPages, alertPage + 1))}
                                disabled={alertPage === totalAlertPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Next
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {activeTab === 'TICKETS' && (
          /* Tickets Table */
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">Tickets</h2>
              <div className="flex flex-wrap items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={ticketSearch}
                  onChange={e => { setTicketSearch(e.target.value); setTicketPage(1); }}
                />
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={ticketStatusFilter}
                  onChange={e => { setTicketStatusFilter(e.target.value); setTicketPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <select
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                  value={ticketPriorityFilter}
                  onChange={e => { setTicketPriorityFilter(e.target.value); setTicketPage(1); }}
                >
                  <option value="">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
            {ticketsLoading ? (
              <div className="p-12 flex justify-center"><LoadingSpinner /></div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No tickets for this Site.</div>
            ) : (
              (() => {
                let filteredTickets = tickets.filter(t => {
                  const matchSearch = (t.title || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
                                      (t.ticketNumber || '').toLowerCase().includes(ticketSearch.toLowerCase());
                  const matchStatus = ticketStatusFilter ? t.status === ticketStatusFilter : true;
                  const matchPriority = ticketPriorityFilter ? t.priority === ticketPriorityFilter : true;
                  return matchSearch && matchStatus && matchPriority;
                });
                
                // Client-side pagination
                const totalTicketPages = Math.ceil(filteredTickets.length / ticketsPerPage);
                const currentTickets = filteredTickets.slice((ticketPage - 1) * ticketsPerPage, ticketPage * ticketsPerPage);

                return (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentTickets.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No matching tickets found.</td></tr>
                          ) : currentTickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.ticketNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <Link to={`/tickets/${ticket.id}`} className="font-medium text-blue-600 truncate max-w-xs block" title={ticket.title}>
                                  {ticket.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                   ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                                   ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 
                                   'bg-gray-100 text-gray-800'
                                 }`}>
                                   {ticket.priority}
                                 </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalTicketPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(ticketPage - 1) * ticketsPerPage + 1}</span> to <span className="font-medium">{Math.min(ticketPage * ticketsPerPage, filteredTickets.length)}</span> of <span className="font-medium">{filteredTickets.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => setTicketPage(Math.max(1, ticketPage - 1))}
                                disabled={ticketPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setTicketPage(Math.min(totalTicketPages, ticketPage + 1))}
                                disabled={ticketPage === totalTicketPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                              >
                                Next
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {activeTab === 'PROVIDERS' && (
          /* Connected Providers */
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Providers</h2>
            {mappingsLoading ? (
              <div className="p-6 flex justify-center"><LoadingSpinner /></div>
            ) : mappings.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-2">No providers connected.</p>
                <button 
                  onClick={() => setIsDiscoverModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Discover Resources &rarr;
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {mappings.map((mapping) => (
                  <li key={mapping.id} className="py-4 flex flex-col space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mapping.providerConnection.displayName || mapping.providerConnection.providerName}</p>
                        <p className="text-xs text-gray-500">Resource: SITE</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          MAPPED
                        </span>
                        <button
                          onClick={() => handleUnmap(mapping.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-2 py-1 rounded transition-opacity"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <p className="text-xs text-gray-500 font-mono break-all" title="External Resource ID">
                        <span className="font-semibold text-gray-700">Ext ID:</span> {mapping.externalResourceId}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {mappings.length > 0 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setIsDiscoverModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Discover More Resources
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <EditSiteModal 
        isOpen={isEditModalOpen} 
        site={site}
        onClose={() => setIsEditModalOpen(false)} 
        onSiteUpdated={fetchSite} 
      />

      <DiscoverResourcesModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
        siteId={site.id}
        onMappingCreated={() => {
          fetchMappings();
          fetchSite();
        }}
      />
    </div>
  );
};

export default SiteDetail;
