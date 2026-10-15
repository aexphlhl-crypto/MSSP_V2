import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { BackupRepositoriesWorkspace } from './components/BackupRepositoriesWorkspace';
import { Database } from 'lucide-react';

const BackupRepositories = () => {
  const { role } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const hasTenantSelected = isPlatformAdmin ? !!currentTenant : true;
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

  const [summary, setSummary] = useState<any>(null);
  const [repositoriesPage, setRepositoriesPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 0,
    size: 25,
    status: '',
    search: '',
    type: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await api.get('/backup/repositories/summary', {
          params: { tenantId: effectiveTenantId }
        });
        if (isMounted) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          // If summary fails, it's fine, we don't want to break the whole page.
          setSummary(null);
        }
      }
    };
    if (hasTenantSelected) {
      fetchSummary();
    }
    return () => { isMounted = false; };
  }, [hasTenantSelected, effectiveTenantId]);

  useEffect(() => {
    let isMounted = true;
    const fetchRepositories = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: filters.page,
          size: filters.size,
          sort: 'name,ASC'
        };
        if (effectiveTenantId) params.tenantId = effectiveTenantId;
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        if (filters.type) params.type = filters.type;

        const response = await api.get('/backup/repositories', { params });
        if (isMounted) {
          setRepositoriesPage(response.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load backup repositories.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (hasTenantSelected) {
      fetchRepositories();
    } else {
      setRepositoriesPage(null);
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

  const fetchRepositoryDetail = async (id: string) => {
    const response = await api.get(`/backup/repositories/${id}`, {
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
          <p className="text-slate-500">Please select a tenant to view backup repositories.</p>
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
      <BackupRepositoriesWorkspace 
        summary={summary}
        repositoriesPage={repositoriesPage}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        fetchRepositoryDetail={fetchRepositoryDetail}
      />
    </div>
  );
};

export default BackupRepositories;
