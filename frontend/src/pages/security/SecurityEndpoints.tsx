import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { SecurityEndpointsWorkspace } from './components/SecurityEndpointsWorkspace';
import { ShieldCheck } from 'lucide-react';

const SecurityEndpoints = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [endpointsPage, setEndpointsPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    protectionStatus: '',
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
          setError('Unable to load security endpoints (Summary API failed).');
        }
      }
    };
    if (hasTenantSelected) {
      fetchSummary();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  // Fetch paginated endpoints whenever filters or tenant changes
  useEffect(() => {
    let isMounted = true;
    const fetchEndpoints = async () => {
      // If the summary API tells us the capability is disabled, do not fetch
      if (summary && !summary?.availableCapabilities?.some((c: any) => c.capability === 'SECURITY_ENDPOINT')) {
        if (isMounted) {
          setEndpointsPage(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: filters.page,
          size: filters.size
        };
        if (effectiveTenantId) params.tenantId = effectiveTenantId;
        if (filters.protectionStatus) params.protectionStatus = filters.protectionStatus;
        if (filters.search) params.search = filters.search;

        const response = await api.get('/security/endpoints', { params });
        if (isMounted) {
          setEndpointsPage(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load security endpoints.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (hasTenantSelected) {
      // Delay fetching until summary is loaded to know capability
      if (summary) {
        fetchEndpoints();
      } else {
        // Just show loading while summary is loading
        setLoading(true);
      }
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId, filters, summary]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const fetchEndpointDetail = async (id: string) => {
    const response = await api.get(`/security/endpoints/${id}`, {
      params: { tenantId: effectiveTenantId }
    });
    return response.data;
  };

  if (!hasTenantSelected) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Tenant Selected</h2>
          <p className="text-slate-500">Please select a tenant to view security endpoints.</p>
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
      <SecurityEndpointsWorkspace 
        summary={summary}
        endpointsPage={endpointsPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchEndpointDetail={fetchEndpointDetail}
      />
    </div>
  );
};

export default SecurityEndpoints;
