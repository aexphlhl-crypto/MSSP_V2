import React, { useState, useEffect } from 'react';
import { Database, Activity, AlertTriangle, PlayCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { BackupJobDetailModal } from './BackupJobDetailModal';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../api/axios';

interface Props {
  summary: any;
  jobsPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  fetchJobDetail: (id: string) => Promise<any>;
}

export const BackupJobsWorkspace: React.FC<Props> = ({
  summary,
  jobsPage,
  loading,
  filters,
  onFilterChange,
  onPageChange,
  fetchJobDetail
}) => {
  const { hasRole } = useAuthStore();
  const canRunJobs = hasRole(['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN']);
  
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedJob, setSelectedJob] = useState<any>(null);
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

  const openJobDetail = async (id: string) => {
    setModalLoading(true);
    setSelectedJob({ id }); // Show loading state with ID
    try {
      const data = await fetchJobDetail(id);
      setSelectedJob(data);
    } catch (e) {
      console.error(e);
      setSelectedJob(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRunJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    try {
      await api.post(`/backup/jobs/${jobId}/run`);
      alert('Backup job execution triggered successfully.');
      // Ideally we would trigger a refresh here, but it's passed from parent
      // We will just alert for now as per BackupDashboard pattern
    } catch (e) {
      console.error(e);
      alert('Failed to run job.');
    }
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">ACTIVE</span>;
      case 'PAUSED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">PAUSED</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">FAILED</span>;
      case 'DISABLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">DISABLED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Backup Jobs</h1>
        <p className="text-slate-500 mt-1">Manage and monitor backup schedules and executions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.totalJobs ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Successful Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.successfulJobs ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Failed Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.failedJobs ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Running Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.runningJobs ?? '—'}</p>
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
                placeholder="Search backup jobs..."
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                className="pl-9 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filters.status}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="FAILED">Failed</option>
                <option value="DISABLED">Disabled</option>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Job Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Run</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Enabled</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {jobsPage?.content?.length > 0 ? (
                jobsPage.content.map((job: any) => (
                  <tr 
                    key={job.id} 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => openJobDetail(job.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{job.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="font-medium">{job.sourceType}</span>: {job.sourceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {job.schedule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {job.enabled ? (
                        <span className="text-emerald-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canRunJobs && (
                        <button 
                          onClick={(e) => handleRunJob(e, job.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full"
                          title="Run Job"
                        >
                          <PlayCircle size={18} className="mr-1" /> Run
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No backup jobs found</h3>
                    <p className="text-slate-500 mt-1">
                      {filters.search || filters.status ? 'No backup jobs match your filters.' : 'There are no backup jobs for this tenant.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {jobsPage && (() => {
          const totalElements = Number(jobsPage.totalElements) || 0;
          const totalPages = Number(jobsPage.totalPages) || 0;
          const pageNumber = Number(jobsPage.number) || 0;
          const pageSize = Number(jobsPage.size) || 25;
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

      {selectedJob && (
        <BackupJobDetailModal 
          job={selectedJob} 
          loading={modalLoading}
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
};
