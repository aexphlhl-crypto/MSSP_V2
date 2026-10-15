import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ENABLE_DEVICE_UI_MOCK, mockDeviceData, mockDeviceAlerts, mockDeviceTickets } from './mockDeviceData';
import { DeviceDetailWorkspace } from './components/DeviceDetailWorkspace';
import { DeviceMetricsDashboard } from './components/DeviceMetricsDashboard';

const DeviceDetail = () => {
  const { id } = useParams();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (ENABLE_DEVICE_UI_MOCK && id === mockDeviceData.id) {
      setDevice(mockDeviceData);
      setLoading(false);
      return;
    }
    
    api.get(`/monitoring/devices/${id}`)
      .then(res => setDevice(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Alerts' && alerts.length === 0) {
      if (ENABLE_DEVICE_UI_MOCK && id === mockDeviceData.id) {
        setAlerts(mockDeviceAlerts);
      } else {
        setLoadingAlerts(true);
        api.get(`/monitoring/alerts?deviceId=${id}`)
          .then(res => setAlerts(res.data.content || res.data))
          .catch(err => console.error(err))
          .finally(() => setLoadingAlerts(false));
      }
    }
    if (activeTab === 'Tickets' && tickets.length === 0) {
      if (ENABLE_DEVICE_UI_MOCK && id === mockDeviceData.id) {
        setTickets(mockDeviceTickets);
      } else {
        setLoadingTickets(true);
        api.get(`/ticketing/tickets?deviceId=${id}`)
          .then(res => setTickets(res.data.content || res.data))
          .catch(err => console.error(err))
          .finally(() => setLoadingTickets(false));
      }
    }
  }, [activeTab, id, alerts.length, tickets.length]);

  if (loading) return <LoadingSpinner />;
  if (!device) return <div>Device not found</div>;

  const tabs = ['Overview', 'Metrics', 'Alerts', 'Tickets', 'Backup', 'Security'];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Workspace Header */}
      <div className="bg-white p-6 shadow-sm rounded-lg border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{device.hostname}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                ${device.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 
                  device.status === 'OFFLINE' ? 'bg-gray-100 text-gray-800' : 
                  device.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 
                  'bg-slate-100 text-slate-800'}`}>
                {device.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span>{device.deviceType || 'Unknown Device Type'}</span>
              <span>•</span>
              <span>{device.ipAddress || 'No IP'}</span>
              <span>•</span>
              <span>Site: {device.siteName || '—'}</span>
            </p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">Connect</button>
             <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 shadow-sm">Create Ticket</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
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
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
           {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Device Information Card */}
              <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-2xl border border-slate-200/60 p-7 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Device Information</h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group/item">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Hostname</dt>
                    <dd className="text-base font-medium text-slate-900 group-hover/item:text-blue-600 transition-colors">{device.hostname}</dd>
                  </div>
                  <div className="group/item">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">IP Address</dt>
                    <dd className="text-base font-medium text-slate-900 group-hover/item:text-blue-600 transition-colors flex items-center gap-2">
                      {device.ipAddress || '—'}
                      {device.ipAddress && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Reachable"></span>}
                    </dd>
                  </div>
                  <div className="group/item">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Device Type</dt>
                    <dd className="text-base font-medium text-slate-900 group-hover/item:text-blue-600 transition-colors flex items-center gap-2">
                       <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                       {device.deviceType || '—'}
                    </dd>
                  </div>
                  <div className="group/item">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Last Seen</dt>
                    <dd className="text-base font-medium text-slate-900 group-hover/item:text-blue-600 transition-colors">
                      {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Provider Sources Card */}
              <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-2xl border border-slate-200/60 p-7 hover:shadow-md transition-all duration-300">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Provider Sources</h2>
                </div>
                {device.providerMappings && device.providerMappings.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {device.providerMappings.map((pm: any) => (
                      <li key={pm.providerConnectionId} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer flex justify-between items-center group">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{pm.providerDisplayName || pm.providerName}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5 font-mono">ID: {pm.externalResourceId}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${
                          pm.syncStatus === 'SYNCED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          pm.syncStatus === 'ERROR' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {pm.syncStatus}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    <span className="text-sm font-medium text-slate-500">No providers mapped</span>
                    <span className="text-xs text-slate-400 mt-1">This device is not linked to any external source.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Health Summary
                </h2>
                <div className="space-y-5 relative z-10">
                  {[
                    { label: 'CPU Usage', value: device.cpuUsage, color: 'bg-blue-400' },
                    { label: 'Memory Usage', value: device.memoryUsage, color: 'bg-indigo-400' },
                    { label: 'Disk Usage', value: device.diskUsage, color: 'bg-emerald-400' }
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-300">{metric.label}</span>
                        <span className="text-white">{metric.value != null ? `${metric.value.toFixed(1)}%` : '—'}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 backdrop-blur-sm overflow-hidden">
                        <div className={`h-2 rounded-full ${metric.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                             style={{ width: `${Math.min(metric.value ?? 0, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Metrics' && (
          <DeviceMetricsDashboard deviceId={id!} device={device} />
        )}

        {activeTab === 'Alerts' && (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            {loadingAlerts ? (
              <div className="p-12"><LoadingSpinner /></div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500">No alerts are currently associated with this device.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map(alert => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{alert.severity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{alert.title || alert.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(alert.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Tickets' && (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            {loadingTickets ? (
              <div className="p-12"><LoadingSpinner /></div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500">No tickets are currently associated with this device.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/tickets/${ticket.id}`}>{ticket.ticketNumber}</Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Backup' && (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-12 text-center text-gray-500 flex flex-col items-center">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <p className="text-base font-medium">Backup data is not available for this device.</p>
            <p className="text-sm mt-1">None of your connected backup providers are currently providing backup information for this endpoint.</p>
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-12 text-center text-gray-500 flex flex-col items-center">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-base font-medium">Security information is not available from the connected provider.</p>
            <p className="text-sm mt-1">This capability is not yet supported by the configured provider integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceDetail;
