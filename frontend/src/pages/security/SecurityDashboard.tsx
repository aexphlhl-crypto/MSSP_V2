import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SecurityDashboardWorkspace } from './components/SecurityDashboardWorkspace';
import { ShieldCheck } from 'lucide-react';

const SecurityDashboard = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (hasTenantSelected) {
      fetchData();
    }
  }, [hasTenantSelected, effectiveTenantId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sumRes = await api.get('/security/summary', {
        params: { tenantId: effectiveTenantId }
      });
      setSummary(sumRes.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load security overview data.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasTenantSelected) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Tenant Selected</h2>
          <p className="text-slate-500">Please select a tenant to view the security overview.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 font-medium">{error}</div>;
  }

  return <SecurityDashboardWorkspace summary={summary} isMockPreview={false} />;
};

export default SecurityDashboard;
