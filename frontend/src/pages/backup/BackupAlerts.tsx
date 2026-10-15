import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { BackupAlertsWorkspace } from './components/BackupAlertsWorkspace';
import { Bell } from 'lucide-react';

const BackupAlerts = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [alertsPage, setAlertsPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    status: '',
    severity: '',
    search: '',
  });

  // Fetch summary whenever tenant changes
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await api.get('/backup/alerts/summary', {
          params: { tenantId: effectiveTenantId },
        });
        if (isMounted) setSummary(response.data);
      } catch (err) {
        console.error('Summary fetch failed:', err);
        if (isMounted) setSummary(null);
      }
    };
    if (hasTenantSelected) {
      fetchSummary();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  // Fetch paginated alerts whenever filters or tenant change
  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: filters.page,
          size: filters.size,
          sort: 'createdAt,DESC',
        };
        if (effectiveTenantId) params.tenantId = effectiveTenantId;
        if (filters.status)   params.status   = filters.status;
        if (filters.severity) params.severity  = filters.severity;
        if (filters.search)   params.search    = filters.search;

        const response = await api.get('/backup/alerts', { params });
        if (isMounted) setAlertsPage(response.data);
      } catch (err) {
        console.error('Alerts fetch failed:', err);
        if (isMounted) setError('Unable to load backup alerts.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (hasTenantSelected) {
      fetchAlerts();
    } else {
      setAlertsPage(null);
      setSummary(null);
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId, filters]);

  const handleFilterChange = (newFilters: any) => setFilters(newFilters);
  const handlePageChange   = (newPage: number)  => setFilters({ ...filters, page: newPage });

  const fetchAlertDetail = async (id: string) => {
    const response = await api.get(`/backup/alerts/${id}`, {
      params: { tenantId: effectiveTenantId },
    });
    return response.data;
  };

  const handleAcknowledge = async (id: string) => {
    await api.patch(`/backup/alerts/${id}/acknowledge`, null, {
      params: { tenantId: effectiveTenantId },
    });
    // Refresh both summary and page
    setFilters((f) => ({ ...f }));
  };

  const handleResolve = async (id: string) => {
    await api.patch(`/backup/alerts/${id}/resolve`, null, {
      params: { tenantId: effectiveTenantId },
    });
    setFilters((f) => ({ ...f }));
  };

  if (!hasTenantSelected) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Tenant Selected</h2>
          <p className="text-slate-500">Please select a tenant to view backup alerts.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 text-center shadow-sm max-w-md">
          <h2 className="text-lg font-bold mb-2">Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-100 overflow-auto">
      <BackupAlertsWorkspace
        summary={summary}
        alertsPage={alertsPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchAlertDetail={fetchAlertDetail}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
};

export default BackupAlerts;
