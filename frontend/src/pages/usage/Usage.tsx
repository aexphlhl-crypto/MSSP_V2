import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Cpu, HardDrive, Users, CheckSquare, Layers } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';

const Usage = () => {
  const [usage, setUsage] = useState<any>(null);
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

      const res = await api.get('/usage', { params });
      setUsage(res.data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load plan usage.');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (val: number | null | undefined, unit: string, name: string) => {
    if (val === null || val === undefined) return '—';
    if (name === 'Backup Storage') {
      const bytes = Number(val) || 0;
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    return val.toLocaleString();
  };

  const getMetricIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('storage')) return <HardDrive className="w-5 h-5 text-indigo-500" />;
    if (lowercaseName.includes('job') || lowercaseName.includes('backup')) return <Cpu className="w-5 h-5 text-blue-500" />;
    if (lowercaseName.includes('security') || lowercaseName.includes('endpoint')) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (lowercaseName.includes('user')) return <Users className="w-5 h-5 text-emerald-500" />;
    if (lowercaseName.includes('site')) return <Layers className="w-5 h-5 text-cyan-500" />;
    return <CheckSquare className="w-5 h-5 text-slate-500" />;
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-sm">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Error
          </h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Plan Usage</h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base">
            Monitor infrastructure consumption and subscription boundaries in real time.
          </p>
        </div>
        {usage?.planName && (
          <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wide">
            Plan Tier: {usage.planName}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800" />
          <p className="text-sm text-slate-400 font-medium">Calculating resource consumption...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usage?.categories?.map((cat: any) => {
            const usedVal = Number(cat.used) || 0;
            const limitVal = cat.limit ? Number(cat.limit) : null;
            const utPercent = cat.utilization != null ? Number(cat.utilization) : null;

            return (
              <div 
                key={cat.name} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        {getMetricIcon(cat.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-snug">{cat.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Active resource category</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        {formatValue(usedVal, cat.unit, cat.name)} 
                        <span className="text-slate-400 font-medium mx-1">/</span> 
                        {limitVal ? formatValue(limitVal, cat.unit, cat.name) : 'Unlimited'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Used Quota</div>
                    </div>
                  </div>

                  {limitVal ? (
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden border border-slate-50">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${
                          (utPercent || 0) >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                          (utPercent || 0) >= 75 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-blue-500 to-indigo-650'
                        }`}
                        style={{ width: `${Math.min(utPercent || 0, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden border border-slate-50">
                      <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 w-full" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      !limitVal ? 'bg-emerald-500' :
                      (utPercent || 0) >= 90 ? 'bg-red-500 animate-pulse' :
                      (utPercent || 0) >= 75 ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    Status: {!limitVal ? 'Unlimited Allocation' : (utPercent || 0) >= 90 ? 'Exceeding Threshold' : (utPercent || 0) >= 75 ? 'High Usage' : 'Normal Usage'}
                  </span>
                  <span className={`font-bold ${!limitVal ? 'text-emerald-600' : (utPercent || 0) >= 90 ? 'text-red-600' : (utPercent || 0) >= 75 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {limitVal ? `${(utPercent || 0).toFixed(1)}%` : 'Unlimited'}
                  </span>
                </div>
              </div>
            );
          })}
          {usage?.categories?.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-450 text-sm">
              No usage categories tracked for this plan tier.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Usage;
