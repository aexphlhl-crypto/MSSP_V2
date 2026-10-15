import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { api } from '../../api/axios';
import { VulnerabilitiesWorkspace } from './components/VulnerabilitiesWorkspace';
import { ShieldCheck } from 'lucide-react';

const Vulnerabilities: React.FC = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [vulnerabilitiesPage, setVulnerabilitiesPage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    severity: '',
    status: '',
    search: ''
  });

  // Fetch summary once per tenant
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
          setError('Unable to load security summary.');
        }
      }
    };

    if (hasTenantSelected) {
      fetchSummary();
    }

    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  // Fetch paginated vulnerabilities whenever filters or tenant changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchVulnerabilities = async () => {
      // Do not fetch if capability is known to be missing
      if (summary && !summary.availableCapabilities?.some((c: any) => c.capability === 'VULNERABILITY')) {
        setLoading(false);
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

        if (filters.severity) params.severity = filters.severity;
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;

        const response = await api.get('/security/vulnerabilities', { params });
        if (isMounted) {
          setVulnerabilitiesPage(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load vulnerabilities.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (hasTenantSelected) {
      fetchVulnerabilities();
    }

    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId, filters, summary]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const fetchVulnerabilityDetail = async (id: string) => {
    const response = await api.get(`/security/vulnerabilities/${id}`, {
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
          <p className="text-slate-500">Please select a tenant to view vulnerabilities.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 p-6">
        <div className="text-center p-8 bg-red-50 rounded border border-red-100 max-w-md">
          <h2 className="text-red-800 font-bold mb-2">Error</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded text-sm hover:bg-red-50 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-100 overflow-auto">
      <VulnerabilitiesWorkspace 
        summary={summary}
        vulnerabilitiesPage={vulnerabilitiesPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchVulnerabilityDetail={fetchVulnerabilityDetail}
      />
    </div>
  );
};

export default Vulnerabilities;
