import React, { useState } from 'react';
import { Server, Monitor, Laptop, RefreshCw, Plus, ExternalLink, Activity, Terminal, Shield, HardDrive, Cpu, Clock, Calendar, CheckCircle2, AlertTriangle, AlertCircle, PlayCircle, BarChart3, Settings2 } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface Props {
  device: any;
  alerts: any[];
  tickets: any[];
  loadingAlerts: boolean;
  loadingTickets: boolean;
  onTabChange?: (tab: string) => void;
  isMockPreview?: boolean;
}

const CapabilityUnavailable = ({ capability }: { capability: string }) => (
  <div className="bg-white border border-slate-200 rounded p-12 flex flex-col items-center text-center">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
      <Settings2 className="w-5 h-5 text-slate-300" />
    </div>
    <p className="text-slate-700 font-medium text-sm">Not available from connected provider</p>
    <p className="text-slate-400 text-xs mt-1 max-w-sm">The {capability} capability is not exposed by the current provider integration.</p>
  </div>
);

const formatBytes = (bytes: number) => {
  if (!bytes) return '—';
  const gb = bytes / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
};

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export const DeviceDetailWorkspace: React.FC<Props> = ({
  device,
  alerts,
  tickets,
  loadingAlerts,
  loadingTickets,
  onTabChange,
  isMockPreview
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const getDeviceIcon = () => {
    if (device.deviceType?.toLowerCase().includes('server')) return <Server className="w-5 h-5 text-slate-600" />;
    if (device.deviceType?.toLowerCase().includes('laptop')) return <Laptop className="w-5 h-5 text-slate-600" />;
    return <Monitor className="w-5 h-5 text-slate-600" />;
  };

  const infoCount = Math.max(0, (device.alertCount || 0) - (device.criticalAlertCount || 0) - (device.warningAlertCount || 0));

  const hasCapability = (cap: string) => {
    return isMockPreview || (device.capabilities && device.capabilities.includes(cap));
  };

  const firstMapping = device.providerMappings?.[0];

  const TABS = [
    'Overview',
    'Hardware',
    'Disks',
    'OS & Security',
    'Software',
    'Metrics',
    'Alerts',
    'Tickets',
    'Activity',
    'Provider Source'
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] space-y-3 pb-8 text-sm">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-50 rounded border border-slate-200 mt-0.5">
            {getDeviceIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{device.hostname}</h1>
              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded 
                ${device.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 
                  device.status === 'OFFLINE' ? 'bg-slate-100 text-slate-700' : 
                  device.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 
                  'bg-slate-100 text-slate-600'}`}>
                {device.status}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center text-xs text-slate-500 mt-1.5 gap-x-4 gap-y-1">
              <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1" /> {device.deviceType || 'Unknown Type'}</span>
              <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1" /> {device.operatingSystem || 'Unknown OS'}</span>
              <span className="flex items-center"><Terminal className="w-3.5 h-3.5 mr-1" /> {device.network?.privateIp || device.ipAddress || 'No IP'}</span>
              <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1" /> Site: {device.siteName || '—'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center space-x-2">
            {hasCapability('DEVICE_REMOTE_ACCESS') && (
              <button className="flex items-center px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 font-medium rounded text-xs transition-colors shadow-sm">
                <Terminal className="w-3.5 h-3.5 mr-1.5" />
                Connect
              </button>
            )}
            {firstMapping && (
              <button className="flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded text-xs transition-colors shadow-sm">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Provider
              </button>
            )}
            <button className="flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded text-xs transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ticket
            </button>
          </div>
          
          <div className="flex items-center space-x-3 text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <span className="flex items-center font-medium"><AlertCircle className="w-3 h-3 text-red-500 mr-1" /> {device.criticalAlertCount || 0} Critical</span>
            <span className="flex items-center font-medium"><AlertTriangle className="w-3 h-3 text-amber-500 mr-1" /> {device.warningAlertCount || 0} Warning</span>
            <span className="flex items-center text-slate-500"><Activity className="w-3 h-3 mr-1" /> Last seen {timeAgo(device.lastSeenAt)}</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded flex overflow-x-auto shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="mt-2">
          
          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider">Device Identity</div>
                  <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Hostname</span><span className="font-medium text-slate-900">{device.hostname}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Site</span><span className="font-medium text-slate-900">{device.siteName || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Operating System</span><span className="font-medium text-slate-900">{device.operatingSystem || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Domain / Workgroup</span><span className="font-medium text-slate-900">{device.network?.domain || device.network?.workgroup || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Provider Source</span><span className="font-medium text-slate-900 flex items-center">{firstMapping?.providerName || '—'} {firstMapping?.syncStatus === 'OK' && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" />}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Added to Platform</span><span className="font-medium text-slate-900">{new Date(device.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider">Network Interfaces</div>
                  <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Private IP Address</span><span className="font-mono text-indigo-700">{device.network?.privateIp || device.ipAddress || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">Public IP Address</span><span className="font-mono text-slate-900">{device.network?.publicIp || device.publicIp || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">MAC Address</span><span className="font-mono text-slate-900">{device.network?.macAddresses?.[0] || '—'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 mb-0.5">DNS Servers</span><span className="font-mono text-slate-900">{device.network?.dnsServers?.join(', ') || '—'}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider">Resource Utilization</div>
                  <div className="p-4 space-y-4 text-sm">
                    <div>
                      <div className="flex justify-between mb-1 text-xs"><span className="text-slate-600 font-medium">CPU</span><span className="font-bold">{device.cpuUsage?.toFixed(1) || 0}%</span></div>
                      <div className="w-full bg-slate-100 rounded h-1.5"><div className={`h-1.5 rounded ${device.cpuUsage > 85 ? 'bg-red-500' : device.cpuUsage > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, device.cpuUsage || 0)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs"><span className="text-slate-600 font-medium">Memory</span><span className="font-bold">{device.memoryUsage?.toFixed(1) || 0}%</span></div>
                      <div className="w-full bg-slate-100 rounded h-1.5"><div className={`h-1.5 rounded ${device.memoryUsage > 85 ? 'bg-red-500' : device.memoryUsage > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, device.memoryUsage || 0)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs"><span className="text-slate-600 font-medium">System Disk</span><span className="font-bold">{device.diskUsage?.toFixed(1) || 0}%</span></div>
                      <div className="w-full bg-slate-100 rounded h-1.5"><div className={`h-1.5 rounded ${device.diskUsage > 85 ? 'bg-red-500' : device.diskUsage > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, device.diskUsage || 0)}%` }}></div></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider">Quick Actions</div>
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded flex items-center">
                      <Terminal className="w-3.5 h-3.5 mr-2 text-slate-400" /> Connect via Terminal
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded flex items-center">
                      <PlayCircle className="w-3.5 h-3.5 mr-2 text-slate-400" /> Execute Script
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded flex items-center">
                      <RefreshCw className="w-3.5 h-3.5 mr-2 text-slate-400" /> Force Sync Provider Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HARDWARE */}
          {activeTab === 'Hardware' && (
            !hasCapability('DEVICE_HARDWARE') ? <CapabilityUnavailable capability="DEVICE_HARDWARE" /> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center"><Cpu className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> System Specifications</div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Manufacturer</span><span className="text-sm font-medium">{device.hardware?.manufacturer || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Model</span><span className="text-sm font-medium">{device.hardware?.model || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Serial Number</span><span className="text-sm font-mono text-indigo-700">{device.hardware?.serialNumber || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Processor</span><span className="text-sm font-medium text-right max-w-[220px] truncate" title={device.hardware?.processor}>{device.hardware?.processor || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Processor Cores</span><span className="text-sm font-medium">{device.hardware?.processorCores || '—'} Cores</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Total Memory</span><span className="text-sm font-medium">{formatBytes(device.hardware?.memoryTotalBytes)}</span></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Motherboard & BIOS</div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Motherboard</span><span className="text-sm font-medium">{device.hardware?.motherboard || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">BIOS Manufacturer</span><span className="text-sm font-medium">{device.hardware?.biosManufacturer || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">BIOS Version</span><span className="text-sm font-medium">{device.hardware?.biosVersion || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">BIOS Date</span><span className="text-sm font-medium">{device.hardware?.biosDate || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">GPU Manufacturer</span><span className="text-sm font-medium">{device.hardware?.gpuVendor || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">GPU Model</span><span className="text-sm font-medium">{device.hardware?.gpuModel || '—'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* DISKS */}
          {activeTab === 'Disks' && (
            !hasCapability('DEVICE_DISKS') ? <CapabilityUnavailable capability="DEVICE_DISKS" /> :
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">Drive</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name & Hardware</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-48">Capacity</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-48">Usage</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Encryption</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Health</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {(device.disks || []).map((disk: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {disk.drive ? <span className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs px-2 py-0.5 rounded shadow-sm">{disk.drive}</span> : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{disk.name || `Disk ${i+1}`}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{disk.type ? `${disk.type} • ` : ''}{disk.model || 'Unknown'} {disk.serialNumber ? `(${disk.serialNumber})` : ''}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <div className="flex justify-between w-full mb-1">
                          <span className="text-slate-500 font-medium">Free: {formatBytes(disk.freeCapacityBytes)}</span>
                          <span className="text-slate-700 font-bold">Total: {formatBytes(disk.totalCapacityBytes)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-slate-100 rounded-sm h-2 border border-slate-200">
                            <div className={`h-full rounded-sm ${(disk.usagePercentage || 0) > 85 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, disk.usagePercentage || 0)}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-600 font-bold w-10 text-right">{Math.round(disk.usagePercentage || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                        {disk.encryptionStatus || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {disk.healthStatus ? (
                           <span className="flex items-center text-emerald-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {disk.healthStatus}</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OS & SECURITY */}
          {activeTab === 'OS & Security' && (
            (!hasCapability('DEVICE_OS') && !hasCapability('DEVICE_SECURITY')) ? <CapabilityUnavailable capability="DEVICE_OS/SECURITY" /> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center"><Monitor className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Operating System</div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Edition</span><span className="text-sm font-bold text-slate-800">{device.os?.edition || device.os?.name || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Version</span><span className="text-sm font-medium">{device.os?.version || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">OS Build</span><span className="text-sm font-medium font-mono text-slate-600">{device.os?.build || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Architecture</span><span className="text-sm font-medium">{device.os?.architecture || '—'}</span></div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Install Date</span><span className="text-sm font-medium">{device.os?.installDate || '—'}</span></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Security Posture</div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Antivirus</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{device.security?.antivirus || '—'}</span>
                      {device.security?.antivirusStatus && <span className={`text-[10px] font-bold uppercase ${device.security?.antivirusStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'}`}>{device.security.antivirusStatus}</span>}
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Firewall</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{device.security?.firewall || '—'}</span>
                      {device.security?.firewallStatus && <span className={`text-[10px] font-bold uppercase ${device.security?.firewallStatus === 'ENABLED' ? 'text-emerald-600' : 'text-slate-500'}`}>{device.security.firewallStatus}</span>}
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Encryption</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{device.security?.encryption || '—'}</span>
                      {device.security?.encryptionStatus && <span className={`text-[10px] font-bold uppercase ${device.security?.encryptionStatus === 'ENABLED' ? 'text-emerald-600' : 'text-slate-500'}`}>{device.security.encryptionStatus}</span>}
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center"><span className="text-xs text-slate-500">Secure Boot</span><span className="text-sm font-medium">{device.security?.secureBoot ? 'Enabled' : 'Disabled'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* SOFTWARE */}
          {activeTab === 'Software' && (
            !hasCapability('DEVICE_SOFTWARE') ? <CapabilityUnavailable capability="DEVICE_SOFTWARE" /> :
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Software Name</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Version</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Publisher</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Install Date</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {(device.software || []).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-5 py-2 whitespace-nowrap text-sm font-semibold text-slate-800">{s.name}</td>
                      <td className="px-5 py-2 whitespace-nowrap text-sm font-mono text-slate-600">{s.version || '—'}</td>
                      <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-600">{s.publisher || '—'}</td>
                      <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500">{s.installDate || '—'}</td>
                      <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500"><span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Installed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* METRICS */}
          {activeTab === 'Metrics' && (
            !hasCapability('DEVICE_METRICS') ? <CapabilityUnavailable capability="DEVICE_METRICS" /> :
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <select className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option>Last 1 Hour</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[ 
                  { label: 'CPU Usage', val: device.cpuUsage, avg: (device.cpuUsage || 0) * 0.8 }, 
                  { label: 'Memory Usage', val: device.memoryUsage, avg: (device.memoryUsage || 0) * 0.9 }, 
                  { label: 'Disk Usage', val: device.diskUsage, avg: (device.diskUsage || 0) * 0.95 }
                ].map((m, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-800 text-sm">{m.label}</span>
                      <span className="text-xs text-slate-400 font-medium">AVG: {m.avg.toFixed(1)}%</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col items-center justify-center relative min-h-[160px]">
                      {/* Fake Chart Background */}
                      <div className="absolute inset-0 opacity-10 flex items-end">
                        <svg className="w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,100 L0,60 Q25,80 50,40 T100,50 L100,100 Z" fill="currentColor" className="text-indigo-600" />
                          <path d="M0,60 Q25,80 50,40 T100,50" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600" />
                        </svg>
                      </div>
                      <div className="text-[40px] font-bold text-slate-800 z-10 leading-none">{m.val?.toFixed(1) || 0}%</div>
                      <div className="text-xs font-semibold text-emerald-500 z-10 mt-2 flex items-center bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100">Current Value</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALERTS */}
          {activeTab === 'Alerts' && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              {loadingAlerts ? <div className="p-12"><LoadingSpinner /></div> : alerts.length === 0 ? <div className="p-12 text-center text-slate-500">No active alerts for this device.</div> : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alert</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {alerts.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-5 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            a.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{a.severity}</span>
                        </td>
                        <td className="px-5 py-2 whitespace-nowrap text-sm font-semibold text-slate-800">{a.name}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs font-medium text-slate-600">{a.status}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500">{a.source || firstMapping?.providerName || 'Platform'}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500">{timeAgo(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TICKETS */}
          {activeTab === 'Tickets' && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              {loadingTickets ? <div className="p-12"><LoadingSpinner /></div> : tickets.length === 0 ? <div className="p-12 text-center text-slate-500">No tickets associated with this device.</div> : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {tickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-5 py-2 whitespace-nowrap text-sm font-bold text-indigo-600 cursor-pointer">{t.ticketNumber}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{t.title}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs">
                          <span className={`px-2 py-0.5 font-bold uppercase rounded ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span>
                        </td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs font-medium text-slate-600">{t.status}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500">{t.assignee || 'Unassigned'}</td>
                        <td className="px-5 py-2 whitespace-nowrap text-xs text-slate-500">{timeAgo(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ACTIVITY */}
          {activeTab === 'Activity' && (
            !hasCapability('DEVICE_ACTIVITY') && (!device.activityEvents || device.activityEvents.length === 0) ? <CapabilityUnavailable capability="DEVICE_ACTIVITY" /> :
            <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
              <div className="space-y-6">
                {(device.activityEvents || []).map((e: any, i: number) => (
                  <div key={i} className="flex relative">
                    {i !== (device.activityEvents?.length || 0) - 1 && <div className="absolute left-2 top-5 w-0.5 h-full bg-slate-200"></div>}
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500 mt-0.5 mr-4 z-10"></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{e.eventType}</span>
                        <span className="text-[11px] text-slate-400 font-medium">• {new Date(e.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 font-medium">{e.description}</p>
                      <p className="text-[11px] font-bold uppercase text-slate-400 mt-1.5">Source: {e.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROVIDER SOURCE */}
          {activeTab === 'Provider Source' && (
            <div className="grid grid-cols-1 gap-4">
              {(device.providerMappings || []).map((m: any, i: number) => (
                <div key={i} className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col md:flex-row">
                  <div className="bg-slate-50 border-r border-slate-100 p-5 md:w-64 flex flex-col justify-center items-start">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{m.providerDisplayName || m.providerName}</h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-200">{m.providerType}</span>
                  </div>
                  <div className="p-5 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="flex flex-col"><span className="text-[11px] font-bold uppercase text-slate-400 mb-0.5">External Resource ID</span><span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">{m.externalResourceId}</span></div>
                    <div className="flex flex-col"><span className="text-[11px] font-bold uppercase text-slate-400 mb-0.5">Resource Type</span><span className="font-medium text-slate-800">DEVICE</span></div>
                    <div className="flex flex-col"><span className="text-[11px] font-bold uppercase text-slate-400 mb-0.5">Sync Status</span><span className="font-bold text-emerald-600 flex items-center">{m.syncStatus === 'OK' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />} {m.syncStatus}</span></div>
                    <div className="flex flex-col"><span className="text-[11px] font-bold uppercase text-slate-400 mb-0.5">Last Synchronization</span><span className="font-medium text-slate-800">{new Date(m.lastSyncedAt).toLocaleString()} ({timeAgo(m.lastSyncedAt)})</span></div>
                    <div className="sm:col-span-2 mt-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 block">Available Capabilities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {device.capabilities?.map((c: string) => (
                          <span key={c} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
