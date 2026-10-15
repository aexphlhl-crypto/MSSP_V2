import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';

const Contracts = () => {
  const [summary, setSummary] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
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

      const sumRes = await api.get('/contracts/summary', { params });
      setSummary(sumRes.data);

      const conRes = await api.get('/contracts', { params });
      setContracts(conRes.data.content || []);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load Customer Contracts.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Contracts</h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base">
            Track customer subscription agreements, status updates, and contract lifecycles.
          </p>
        </div>
        {isPlatformUser && currentTenant && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Scope: {currentTenant.name}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800" />
          <p className="text-sm text-slate-400 font-medium">Fetching contract profiles...</p>
        </div>
      ) : (
        <>
          {/* Contracts Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                <FileText size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Contracts</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{summary?.totalContracts ?? '—'}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
                <CheckCircle size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{summary?.activeContracts ?? '—'}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mr-4">
                <Clock size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Expiring Soon</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{summary?.expiringSoonContracts ?? '—'}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-red-50 text-red-650 rounded-xl mr-4">
                <AlertTriangle size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Expired</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{summary?.expiredContracts ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Customer Agreements</h2>
              <p className="text-xs text-slate-450 mt-0.5">Formal subscription terms and validity periods.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant Identifier</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {contracts.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{c.accountName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {c.tenantId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.status === 'EXPIRED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            c.status === 'ACTIVE' ? 'bg-emerald-500' :
                            c.status === 'EXPIRED' ? 'bg-red-500' : 'bg-slate-500'
                          }`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-550">
                        {formatDate(c.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-550">
                        {formatDate(c.endDate)}
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No customer contracts found.
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

export default Contracts;
