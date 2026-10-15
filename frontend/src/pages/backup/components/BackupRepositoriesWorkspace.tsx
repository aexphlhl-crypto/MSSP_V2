import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BackupRepositoryDetailModal } from './BackupRepositoryDetailModal';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  summary: any;
  repositoriesPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  fetchRepositoryDetail: (id: string) => Promise<any>;
}

const formatBytes = (bytes: number | null | undefined) => {
  if (bytes === null || bytes === undefined) return '—';
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BackupRepositoriesWorkspace: React.FC<Props> = ({
  summary,
  repositoriesPage,
  loading,
  filters,
  onFilterChange,
  onPageChange,
  fetchRepositoryDetail
}) => {
  const { hasRole } = useAuthStore();
  
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput, page: 0 });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, filters, onFilterChange]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value, page: 0 });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, type: e.target.value, page: 0 });
  };

  const openRepoDetail = async (id: string) => {
    setModalLoading(true);
    setSelectedRepo({ id }); // Show loading state with ID
    try {
      const data = await fetchRepositoryDetail(id);
      setSelectedRepo(data);
    } catch (e) {
      console.error(e);
      setSelectedRepo(null);
    } finally {
      setModalLoading(false);
    }
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">ONLINE</span>;
      case 'OFFLINE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">OFFLINE</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">WARNING</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Backup Repositories</h1>
        <p className="text-slate-500 mt-1">Monitor backup storage repositories and capacity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Repositories</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.totalRepositories ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg mr-4">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Capacity</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.totalCapacityBytes !== undefined ? formatBytes(summary.totalCapacityBytes) : '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Used Capacity</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.usedCapacityBytes !== undefined ? formatBytes(summary.usedCapacityBytes) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">
        
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search repositories..."
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                className="pl-9 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filters.type}
                onChange={handleTypeChange}
              >
                <option value="">All Types</option>
                <option value="LOCAL">Local</option>
                <option value="NFS">NFS</option>
                <option value="SMB">SMB</option>
                <option value="S3">S3</option>
                <option value="MINIO">MinIO</option>
                <option value="CLOUD">Cloud</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                className="pl-9 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filters.status}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="ONLINE">Online</option>
                <option value="WARNING">Warning</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : null}

          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white sticky top-0 z-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Repository Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Used</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usage %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {repositoriesPage?.content?.length > 0 ? (
                repositoriesPage.content.map((repo: any) => {
                  const capacity = repo.capacityBytes || 0;
                  const used = repo.usedBytes || 0;
                  const usagePct = capacity > 0 ? Math.round((used / capacity) * 100) : 0;

                  return (
                    <tr 
                      key={repo.id} 
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => openRepoDetail(repo.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{repo.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {repo.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {repo.endpoint || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderBadge(repo.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatBytes(capacity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatBytes(used)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="mr-2 text-slate-700">{usagePct}%</span>
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${usagePct > 90 ? 'bg-red-500' : usagePct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, Math.max(0, usagePct))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No backup repositories found</h3>
                    <p className="text-slate-500 mt-1">
                      {filters.search || filters.status || filters.type ? 'No backup repositories match your filters.' : 'There are no backup repositories for this tenant.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {repositoriesPage && (() => {
          const totalElements = Number(repositoriesPage.totalElements) || 0;
          const totalPages = Number(repositoriesPage.totalPages) || 0;
          const pageNumber = Number(repositoriesPage.number) || 0;
          const pageSize = Number(repositoriesPage.size) || 25;
          const startItem = totalElements === 0 ? 0 : (pageNumber * pageSize) + 1;
          const endItem = Math.min((pageNumber + 1) * pageSize, totalElements);

          return (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-b-lg">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{startItem}</span> to <span className="font-medium text-slate-900">{endItem}</span> of <span className="font-medium text-slate-900">{totalElements}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(pageNumber - 1)}
                  disabled={pageNumber === 0}
                  className="p-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages - 1 || totalPages === 0}
                  className="p-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {selectedRepo && (
        <BackupRepositoryDetailModal 
          repository={selectedRepo} 
          loading={modalLoading}
          onClose={() => setSelectedRepo(null)} 
        />
      )}
    </div>
  );
};
