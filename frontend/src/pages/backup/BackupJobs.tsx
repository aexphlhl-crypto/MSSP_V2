import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { BackupJobsWorkspace } from './components/BackupJobsWorkspace';
import { Database } from 'lucide-react';

const BackupJobs = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [jobsPage, setJobsPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    status: '',
    search: ''
  });

  // Fetch summary once (or when tenant changes) to get KPIs
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await api.get('/backup/summary', {
          params: { tenantId: effectiveTenantId }
        });
        if (isMounted) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load backup jobs (Summary API failed).');
        }
      }
    };
    if (hasTenantSelected) {
      fetchSummary();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  // Fetch paginated jobs whenever filters or tenant changes
  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: filters.page,
          size: filters.size,
          sort: 'lastRunAt,DESC'
        };
        if (effectiveTenantId) params.tenantId = effectiveTenantId;
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;

        const response = await api.get('/backup/jobs', { params });
        if (isMounted) {
          setJobsPage(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load backup jobs.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (hasTenantSelected) {
      fetchJobs();
    } else {
      // Clear data if no tenant
      setJobsPage(null);
      setSummary(null);
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const fetchJobDetail = async (id: string) => {
    const response = await api.get(`/backup/jobs/${id}`, {
      params: { tenantId: effectiveTenantId }
    });
    return response.data;
  };

  if (!hasTenantSelected) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
          <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Tenant Selected</h2>
          <p className="text-slate-500">Please select a tenant to view backup jobs.</p>
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
      <BackupJobsWorkspace 
        summary={summary}
        jobsPage={jobsPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchJobDetail={fetchJobDetail}
      />
    </div>
  );
};

export default BackupJobs;
