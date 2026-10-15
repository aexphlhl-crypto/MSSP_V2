import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Server, Ticket, ShieldAlert, Database, Lock, CheckCircle, 
  AlertTriangle, ShieldCheck, Plus, 
  Activity, AlertCircle, Eye, Monitor, HardDrive, Clock
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { clsx } from 'clsx';

const formatMetric = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '—';
  return value.toLocaleString();
};

const formatStorage = (bytes: number | null | undefined) => {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// --- Custom Interactive Donut Chart ---
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const DonutChart: React.FC<{ data: DonutSegment[]; title: string; description: string }> = ({ data, title, description }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedPercent = 0;
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-64 w-full">
        <span className="text-slate-400 text-sm font-medium">No data available for {title}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-80 w-full">
      <div>
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center justify-around my-4 gap-4">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4.2" />
            {data.map((seg) => {
              const percent = (seg.value / total) * 100;
              if (percent <= 0) return null;
              const strokeDasharray = `${percent} ${100 - percent}`;
              const strokeDashoffset = 100 - accumulatedPercent + 25; // 25 to start at top
              accumulatedPercent += percent;
              return (
                <circle
                  key={seg.label}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="4.2"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-black text-slate-850 block">{total}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block -mt-1">Total</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 max-w-[50%] overflow-hidden">
          {data.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div key={seg.label} className="flex items-center text-xs font-semibold text-slate-650 gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="truncate">{seg.label}:</span>
                <span className="text-slate-850 font-bold ml-auto shrink-0">{seg.value} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Custom Bar Chart ---
interface BarItem {
  label: string;
  value: number;
  color: string;
}

const BarChart: React.FC<{ data: BarItem[]; title: string; description: string }> = ({ data, title, description }) => {
  const maxVal = Math.max(...data.map(d => d.value), 0);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-64 w-full">
        <span className="text-slate-400 text-sm font-medium">No data available for {title}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-80 w-full">
      <div>
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="flex flex-col gap-4 my-4 flex-1 justify-center">
        {data.map((item) => {
          const percent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{item.label}</span>
                <span className="text-slate-850">{item.value}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-50">
                <div
                  className="h-3.5 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [ticketSummary, setTicketSummary] = useState<any>(null);
  const [monitoringSummary, setMonitoringSummary] = useState<any>(null);
  const [securitySummary, setSecuritySummary] = useState<any>(null);
  const [backupSummary, setBackupSummary] = useState<any>(null);
  const [slaSummary, setSlaSummary] = useState<any>(null);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [activeIncidents] = useState<any[]>([]); // API not implemented yet
  
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const { hasEntitlement, role } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const isPlanUser = role === 'ROLE_PLATFORM_ADMIN' || role === 'ROLE_PLATFORM_TECH' || role === 'ROLE_CUSTOMER_ADMIN';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrors({});

    const promises: Promise<any>[] = [];

    if (hasEntitlement('TICKETING')) {
      promises.push(
        api.get('/tickets/summary')
          .then(res => setTicketSummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, ticketing: true })))
      );
      promises.push(
        api.get('/sla/summary')
          .then(res => setSlaSummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, sla: true })))
      );
    }

    if (hasEntitlement('MONITORING_BASIC')) {
      promises.push(
        api.get('/monitoring/summary')
          .then(res => setMonitoringSummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, monitoring: true })))
      );
      promises.push(
        api.get('/monitoring/alerts')
          .then(res => {
            if (Array.isArray(res.data)) {
              setRecentAlerts(res.data.slice(0, 5));
            }
          })
          .catch(() => setErrors(prev => ({ ...prev, alerts: true })))
      );
    }

    if (hasEntitlement('SECURITY_BASIC')) {
      promises.push(
        api.get('/security/summary')
          .then(res => setSecuritySummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, security: true })))
      );
    }

    if (hasEntitlement('BACKUP_BASIC')) {
      promises.push(
        api.get('/backup/summary')
          .then(res => setBackupSummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, backup: true })))
      );
    }

    if (isPlanUser) {
      promises.push(
        api.get('/usage')
          .then(res => setUsageSummary(res.data))
          .catch(() => setErrors(prev => ({ ...prev, usage: true })))
      );
    }

    await Promise.allSettled(promises);
    setLoading(false);
  };

  // Compliance calculations
  const totalPolicies = slaSummary?.totalPolicies ?? 0;
  const breaches = slaSummary?.breaches ?? 0;
  const complianceRate = totalPolicies > 0 ? Math.round(((totalPolicies - breaches) / totalPolicies) * 100) : 100;

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-8 animate-fadeIn">
      {/* Dashboard Title & Scope */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MSP Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Operational status, backup success rates, and vulnerability distributions.
          </p>
        </div>
        {currentTenant && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Scope: {currentTenant.name}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800" />
          <p className="text-sm text-slate-400 font-medium">Loading executive profile metrics...</p>
        </div>
      ) : (
        <>
          {/* 1. TOP KPI ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            
            {/* Total Tickets */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.ticketing ? 'Error' : formatMetric(ticketSummary?.openTickets)}</span>
                <Ticket className="w-5 h-5 text-indigo-500 shrink-0" />
              </div>
            </div>

            {/* SLA Breaches */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Breaches</span>
              <div className="flex items-end justify-between mt-2">
                <span className={clsx("text-2xl font-black", breaches > 0 ? "text-red-650" : "text-slate-850")}>
                  {errors.sla ? 'Error' : breaches}
                </span>
                <Clock className="w-5 h-5 text-red-500 shrink-0" />
              </div>
            </div>

            {/* SLA Compliance */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.sla ? 'Error' : `${complianceRate}%`}</span>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>
            </div>

            {/* Open Alerts */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Alerts</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.monitoring ? 'Error' : formatMetric(monitoringSummary?.openAlerts)}</span>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              </div>
            </div>

            {/* Critical Vulns */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Vulns</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.security ? 'Error' : formatMetric(securitySummary?.criticalVulnerabilities)}</span>
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              </div>
            </div>

            {/* Endpoints */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endpoints</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.security ? 'Error' : formatMetric(securitySummary?.protectedEndpoints)}</span>
                <Monitor className="w-5 h-5 text-blue-500 shrink-0" />
              </div>
            </div>

            {/* Backup Jobs */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup Jobs</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-850">{errors.backup ? 'Error' : formatMetric(backupSummary?.totalJobs)}</span>
                <Database className="w-5 h-5 text-cyan-500 shrink-0" />
              </div>
            </div>

            {/* Storage Used */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Used</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold text-slate-850 truncate max-w-[90%]">
                  {errors.backup ? 'Error' : formatStorage(backupSummary?.storageUsed)}
                </span>
                <HardDrive className="w-5 h-5 text-indigo-500 shrink-0" />
              </div>
            </div>

          </div>

          {/* 2. VISUALIZATION ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Endpoint Protection Donut */}
            {errors.security ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-650 h-80 flex items-center justify-center">
                Failed to load Security Endpoint data.
              </div>
            ) : (
              <DonutChart 
                title="Endpoint Protection Status"
                description="Status distribution of monitored security endpoints."
                data={[
                  { label: 'Protected', value: Number(securitySummary?.protectedEndpoints) || 0, color: '#10b981' },
                  { label: 'Unprotected', value: Number(securitySummary?.vulnerableEndpoints) || 0, color: '#ef4444' },
                  { label: 'Warning', value: Number(securitySummary?.warningEndpoints) || 0, color: '#f59e0b' },
                  { label: 'Unknown', value: Number(securitySummary?.unknownEndpoints) || 0, color: '#64748b' }
                ]}
              />
            )}

            {/* Right: Backup Job Status Bar */}
            {errors.backup ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-650 h-80 flex items-center justify-center">
                Failed to load Backup summary data.
              </div>
            ) : (
              <BarChart
                title="Backup Job Status"
                description="Success, failure, and execution status of active backup jobs."
                data={[
                  { label: 'Successful', value: Number(backupSummary?.successfulJobs) || 0, color: '#10b981' },
                  { label: 'Failed', value: Number(backupSummary?.failedJobs) || 0, color: '#ef4444' },
                  { label: 'Running', value: Number(backupSummary?.runningJobs) || 0, color: '#3b82f6' },
                  { label: 'Warning', value: Number(backupSummary?.warningJobs) || 0, color: '#f59e0b' }
                ]}
              />
            )}
          </div>

          {/* 3. VISUALIZATION ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Vulnerability Severity Pie */}
            {errors.security ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-650 h-80 flex items-center justify-center">
                Failed to load Vulnerability status.
              </div>
            ) : (
              <DonutChart 
                title="Vulnerability Severity"
                description="Current security vulnerability distribution by threat level."
                data={[
                  { label: 'Critical', value: Number(securitySummary?.criticalVulnerabilities) || 0, color: '#ef4444' },
                  { label: 'Medium', value: Number(securitySummary?.mediumVulnerabilities) || 0, color: '#f59e0b' },
                  { label: 'Low', value: Number(securitySummary?.lowVulnerabilities) || 0, color: '#3b82f6' }
                ]}
              />
            )}

            {/* Right: Plan Resource Usage Progress Bars */}
            {errors.usage ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-650 h-80 flex items-center justify-center">
                Failed to retrieve quota parameters.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-80 overflow-y-auto">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Plan Quota Consumption</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Resource consumption levels mapped against active plan limits.</p>
                </div>
                <div className="space-y-3.5 my-3">
                  {usageSummary?.categories?.slice(0, 4).map((cat: any) => {
                    const limitVal = cat.limit ? Number(cat.limit) : null;
                    const utPercent = cat.utilization != null ? Number(cat.utilization) : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-650">
                          <span>{cat.name}</span>
                          <span>
                            {formatMetric(cat.used)} / {limitVal ? formatMetric(limitVal) : 'Unlimited'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={clsx(
                              "h-2 rounded-full transition-all duration-500",
                              !limitVal ? "bg-emerald-500 w-full" :
                              utPercent >= 90 ? "bg-red-500" :
                              utPercent >= 75 ? "bg-amber-500" : "bg-blue-500"
                            )}
                            style={{ width: limitVal ? `${Math.min(utPercent, 100)}%` : '100%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(!usageSummary?.categories || usageSummary.categories.length === 0) && (
                    <p className="text-center text-xs text-slate-400 py-6">No plan usage metrics tracked.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. TICKET SUMMARY & ALERTS ROWS */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Ticket status table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-sm font-bold text-slate-800 flex items-center">
                  <Ticket className="w-4 h-4 mr-2 text-indigo-500" /> Ticket Breakdown
                </h2>
                {hasEntitlement('TICKETING') && (
                  <Link to="/tickets" className="text-xs font-bold text-blue-600 hover:text-blue-800">View Workspace</Link>
                )}
              </div>
              <div className="p-4 flex-1">
                {hasEntitlement('TICKETING') ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100" onClick={() => navigate('/tickets')}>
                      <span className="text-xs font-semibold text-slate-500">Open</span>
                      <span className="text-base font-bold text-slate-850">{formatMetric(ticketSummary?.openTickets)}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center cursor-pointer hover:bg-blue-100" onClick={() => navigate('/tickets')}>
                      <span className="text-xs font-semibold text-blue-700">In Progress</span>
                      <span className="text-base font-bold text-blue-900">{formatMetric(ticketSummary?.inProgressTickets)}</span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex justify-between items-center cursor-pointer hover:bg-amber-100" onClick={() => navigate('/tickets')}>
                      <span className="text-xs font-semibold text-amber-700">Pending</span>
                      <span className="text-base font-bold text-amber-900">{formatMetric(ticketSummary?.pendingCustomerTickets)}</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex justify-between items-center cursor-pointer hover:bg-emerald-100" onClick={() => navigate('/tickets')}>
                      <span className="text-xs font-semibold text-emerald-700">Resolved</span>
                      <span className="text-base font-bold text-emerald-900">{formatMetric(ticketSummary?.resolvedTickets)}</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center col-span-2 cursor-pointer hover:bg-red-100" onClick={() => navigate('/tickets')}>
                      <span className="text-xs font-semibold text-red-700">Critical Priority</span>
                      <span className="text-base font-bold text-red-900">{formatMetric(ticketSummary?.criticalTickets)}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Ticketing Disabled" description="Access restricted." />
                )}
              </div>
            </div>

            {/* Recent monitoring alerts */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-sm font-bold text-slate-800 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Recent Alerts
                </h2>
                {hasEntitlement('MONITORING_ALERTS') && (
                  <Link to="/alerts" className="text-xs font-bold text-blue-600 hover:text-blue-800">View Workspace</Link>
                )}
              </div>
              <div className="p-0 flex-1 overflow-x-auto">
                {hasEntitlement('MONITORING_ALERTS') ? (
                  recentAlerts.length > 0 ? (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="text-[10px] text-slate-400 bg-slate-50 border-b border-slate-150 uppercase font-extrabold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Severity</th>
                          <th className="px-4 py-3">Alert</th>
                          <th className="px-4 py-3">Device</th>
                          <th className="px-4 py-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentAlerts.map(alert => (
                          <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5">
                              <StatusBadge 
                                status={alert.severity} 
                                variant={alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'WARNING' ? 'warning' : 'info'} 
                              />
                            </td>
                            <td className="px-4 py-2.5 font-bold text-slate-800 truncate max-w-[200px]">{alert.title}</td>
                            <td className="px-4 py-2.5 text-slate-500 truncate max-w-[150px]">{alert.deviceId?.substring(0, 8) || 'Unknown'}</td>
                            <td className="px-4 py-2.5 text-slate-400">{new Date(alert.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                      No recent alerts active
                    </div>
                  )
                ) : (
                  <EmptyState title="Alerts Disabled" description="Access restricted." />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
