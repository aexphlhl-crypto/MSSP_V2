import React, { useEffect, useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';

const Sla = () => {
  const [summary, setSummary] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const isPlatformUser = role === 'ROLE_PLATFORM_ADMIN' || role === 'ROLE_PLATFORM_TECH';
  const effectiveTenantId = isPlatformUser ? currentTenant?.id : undefined;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTenantId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (effectiveTenantId) params.tenantId = effectiveTenantId;

      const sumRes = await api.get('/sla/summary', { params });
      setSummary(sumRes.data);

      const polRes = await api.get('/sla', { params });
      setPolicies(polRes.data.content || []);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load SLA Commitments.');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (mins: number | null | undefined) => {
    if (mins === null || mins === undefined) return '—';
    if (mins < 60) return `${mins.toFixed(0)}m`;
    const hours = mins / 60;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-sm">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Error
          </h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate compliance status percentage based on breaches
  const totalPolicies = summary?.totalPolicies ?? 0;
  const breaches = summary?.breaches ?? 0;
  const complianceRate = totalPolicies > 0 ? Math.round(((totalPolicies - breaches) / totalPolicies) * 100) : 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SLA Commitments</h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base">
            Track service-level targets, response times, and real-time policy compliance.
          </p>
        </div>
        {isPlatformUser && currentTenant && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Scope: {currentTenant.name}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800" />
          <p className="text-sm text-slate-400 font-medium">Querying SLA metrics...</p>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards & Compliance Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Compliance Circular Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex items-center justify-between col-span-1">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Service Level Status</span>
                <span className="text-2xl font-bold block mb-1.5">Compliance Rate</span>
                <span className="text-sm text-slate-300">
                  {breaches > 0 ? `${breaches} active breach${breaches > 1 ? 'es' : ''} detected` : 'All targets currently satisfied'}
                </span>
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={complianceRate >= 90 ? "#10b981" : complianceRate >= 75 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * complianceRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-xl font-extrabold text-white">
                  {complianceRate}%
                </div>
              </div>
            </div>

            {/* Response/Resolution Time metrics */}
            <div className="grid grid-cols-2 gap-4 col-span-1 lg:col-span-2">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl mr-4">
                  <Clock size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Response Time</p>
                  <p className="text-3xl font-black text-slate-850 mt-1">
                    {summary?.averageResponseTimeMinutes ? formatMinutes(summary.averageResponseTimeMinutes) : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl mr-4">
                  <CheckCircle size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</p>
                  <p className="text-3xl font-black text-slate-850 mt-1">
                    {summary?.averageResolutionTimeMinutes ? formatMinutes(summary.averageResolutionTimeMinutes) : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
                <div className="p-3.5 bg-slate-50 text-slate-600 rounded-xl mr-4">
                  <Shield size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Policies</p>
                  <p className="text-3xl font-black text-slate-850 mt-1">{totalPolicies}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
                <div className="p-3.5 bg-red-50 text-red-600 rounded-xl mr-4">
                  <Flame size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Breached SLA Policies</p>
                  <p className="text-3xl font-black text-slate-850 mt-1">{breaches}</p>
                </div>
              </div>
            </div>

          </div>

          {/* SLA Policies Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">SLA Policy Rules</h2>
                <p className="text-xs text-slate-450 mt-0.5">Commitment thresholds applied for this tenant scope.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target RPO</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target RTO</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {policies.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{p.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                          {formatMinutes(p.targetRpoMinutes)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700">
                          {formatMinutes(p.targetRtoMinutes)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-sm truncate">
                        {p.description || '—'}
                      </td>
                    </tr>
                  ))}
                  {policies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No active SLA policies configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sla;
