import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { SecurityEventsWorkspace } from './components/SecurityEventsWorkspace';
import { ShieldCheck } from 'lucide-react';

const SecurityEvents = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [eventsPage, setEventsPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    severity: '',
    status: '',
    provider: '',
    search: ''
  });

  // Fetch summary once (or when tenant changes) to get KPIs and capabilities
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await api.get('/security/summary', {
          params: { tenantId: effectiveTenantId }
        });
        if (isMounted) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load security events (Summary API failed).');
        }
      }
    };
    if (hasTenantSelected) {
      fetchSummary();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  // Fetch paginated events whenever filters or tenant changes
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: filters.page,
          size: filters.size
        };
        if (effectiveTenantId) params.tenantId = effectiveTenantId;
        if (filters.severity) params.severity = filters.severity;
        if (filters.status) params.status = filters.status;
        if (filters.provider) params.provider = filters.provider;
        if (filters.search) params.search = filters.search;

        const response = await api.get('/security/events', { params });
        if (isMounted) {
          setEventsPage(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load security events.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    if (hasTenantSelected) {
      fetchEvents();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId, filters, summary]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const fetchEventDetail = async (id: string) => {
    const response = await api.get(`/security/events/${id}`, {
      params: { tenantId: currentTenant?.id }
    });
    return response.data;
  };

  if (!hasTenantSelected) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Tenant Selected</h2>
          <p className="text-slate-500">Please select a tenant to view security events.</p>
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
      <SecurityEventsWorkspace 
        summary={summary}
        eventsPage={eventsPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchEventDetail={fetchEventDetail}
      />
    </div>
  );
};

export default SecurityEvents;
