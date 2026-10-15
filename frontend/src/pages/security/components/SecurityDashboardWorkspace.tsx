import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';

interface Props {
  summary: any;
  isMockPreview?: boolean;
}

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const hasCapability = (summary: any, cap: string, isMockPreview: boolean) => {
  if (isMockPreview) return true;
  return summary?.availableCapabilities?.some((c: any) => c.capability === cap);
};

export const SecurityDashboardWorkspace: React.FC<Props> = ({ summary, isMockPreview = false }) => {
  
  const renderKpis = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Critical Events</span>
        <span className="text-xl font-bold text-red-600">
          {hasCapability(summary, 'SECURITY_EVENTS', isMockPreview) ? (summary?.criticalEvents || 0) : 'N/A'}
        </span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Open Vulnerabilities</span>
        <span className="text-xl font-bold text-amber-600">
          {hasCapability(summary, 'VULNERABILITY', isMockPreview) ? (summary?.totalVulnerabilities || 0) : 'N/A'}
        </span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Protected Endpoints</span>
        <span className="text-xl font-bold text-emerald-600">
          {hasCapability(summary, 'SECURITY_ENDPOINT', isMockPreview) ? (summary?.protectedEndpoints || 0) : 'N/A'}
        </span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">At-Risk Endpoints</span>
        <span className="text-xl font-bold text-red-600">
          {hasCapability(summary, 'SECURITY_ENDPOINT', isMockPreview) ? (summary?.vulnerableEndpoints || 0) : 'N/A'}
        </span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Security Events</span>
        <span className="text-xl font-bold text-slate-900">
          {hasCapability(summary, 'SECURITY_EVENTS', isMockPreview) ? (summary?.totalEvents || 0) : 'N/A'}
        </span>
      </div>
    </div>
  );

  const renderHealthSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Endpoint Security Health</span>
          <span className="text-[10px] text-slate-500 font-medium bg-slate-200 px-1.5 py-0.5 rounded">
            {hasCapability(summary, 'SECURITY_ENDPOINT', isMockPreview) ? 'ACTIVE' : 'UNAVAILABLE'}
          </span>
        </div>
        <div className="p-4">
          {!hasCapability(summary, 'SECURITY_ENDPOINT', isMockPreview) ? (
            <div className="text-sm text-slate-500 text-center py-6">Endpoint security data is not available from connected providers.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Protected</span><span className="font-bold">{summary?.protectedEndpoints || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-amber-600 font-medium">Warning</span><span className="font-bold">{summary?.warningEndpoints || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-red-600 font-medium">At Risk</span><span className="font-bold">{summary?.vulnerableEndpoints || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-medium">Unknown</span><span className="font-bold">{summary?.unknownEndpoints || 0}</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vulnerability Severity</span>
          <span className="text-[10px] text-slate-500 font-medium bg-slate-200 px-1.5 py-0.5 rounded">
            {hasCapability(summary, 'VULNERABILITY', isMockPreview) ? 'ACTIVE' : 'UNAVAILABLE'}
          </span>
        </div>
        <div className="p-4">
          {!hasCapability(summary, 'VULNERABILITY', isMockPreview) ? (
            <div className="text-sm text-slate-500 text-center py-6">Vulnerability management is not available from connected providers.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm"><span className="text-red-700 font-medium flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5"/> Critical</span><span className="font-bold">{summary?.criticalVulnerabilities || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-orange-600 font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5"/> High</span><span className="font-bold">{summary?.highEvents || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-amber-500 font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5"/> Medium</span><span className="font-bold">{summary?.mediumVulnerabilities || 0}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-blue-500 font-medium flex items-center"><ShieldCheck className="w-4 h-4 mr-1.5"/> Low</span><span className="font-bold">{summary?.lowVulnerabilities || 0}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecentEvents = () => (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden mb-4">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Security Events</span>
      </div>
      {!hasCapability(summary, 'SECURITY_EVENTS', isMockPreview) ? (
        <div className="text-sm text-slate-500 text-center py-8">Security event data is not available from connected providers.</div>
      ) : summary?.recentEvents?.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">No security events currently available.</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provider</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(summary?.recentEvents || []).map((e: any) => (
              <tr key={e.id} className="hover:bg-slate-50 text-sm">
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    e.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    e.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  }`}>{e.severity}</span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap font-medium text-slate-800">{e.title}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-600">{e.source || '—'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-500">{timeAgo(e.detectedAt)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-slate-700">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderEndpoints = () => (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden mb-4">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Endpoint Protection Status</span>
      </div>
      {!hasCapability(summary, 'SECURITY_ENDPOINT', isMockPreview) ? (
        <div className="text-sm text-slate-500 text-center py-8">Endpoint security data is not available from connected providers.</div>
      ) : summary?.recentEndpoints?.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">No endpoint data currently available.</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hostname</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(summary?.recentEndpoints || []).map((ep: any) => (
              <tr key={ep.id} className="hover:bg-slate-50 text-sm">
                <td className="px-4 py-2 whitespace-nowrap font-semibold text-slate-800">{ep.hostname}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs font-mono text-slate-600">{ep.ipAddress || '—'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                    ep.protectionStatus === 'PROTECTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    ep.protectionStatus === 'AT_RISK' ? 'bg-red-50 text-red-700 border-red-200' :
                    ep.protectionStatus === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>{ep.protectionStatus}</span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">
                  {hasCapability(summary, 'RISK_SCORE', isMockPreview) ? (
                    ep.riskScore != null ? (
                      <div className="flex items-center">
                        <span className={`font-bold mr-2 ${ep.riskScore > 80 ? 'text-red-600' : ep.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{ep.riskScore}</span>
                        <div className="w-16 bg-slate-100 rounded-sm h-1.5"><div className={`h-1.5 rounded-sm ${ep.riskScore > 80 ? 'bg-red-500' : ep.riskScore > 40 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{width: `${ep.riskScore}%`}}></div></div>
                      </div>
                    ) : <span className="text-slate-400 italic">No Data</span>
                  ) : <span className="text-slate-400">N/A</span>}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-500">{timeAgo(ep.lastCheckAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Security Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor and manage endpoint security status</p>
      </div>
      
      {renderKpis()}
      {renderHealthSummary()}
      {renderRecentEvents()}
      {renderEndpoints()}
      
    </div>
  );
};
