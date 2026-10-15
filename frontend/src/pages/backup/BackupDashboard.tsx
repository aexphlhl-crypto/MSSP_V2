import React, { useEffect, useState } from 'react';
import { Database, Activity, AlertTriangle, PlayCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';

const BackupDashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { role, hasRole } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const canRunJobs = hasRole(['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN']);

  const isPlatformAdmin = role === 'ROLE_PLATFORM_ADMIN';
  const effectiveTenantId = isPlatformAdmin ? currentTenant?.id : undefined;

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

      const sumRes = await api.get('/backup/summary', { params });
      setSummary(sumRes.data);

      // GET /backup/jobs now returns Spring Data Page — extract .content
      const jobsRes = await api.get('/backup/jobs', { params: { ...params, size: 10, sort: 'lastRunAt,DESC' } });
      const pageData = jobsRes.data;
      setJobs(Array.isArray(pageData) ? pageData : (pageData?.content ?? []));
    } catch (e: any) {
      console.error(e);
      setError('Failed to load backup overview.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      await api.post(`/backup/jobs/${jobId}/run`);
      alert('Backup job execution triggered successfully.');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to run job.');
    }
  };

  const storageUsedTB = summary ? (Number(summary.storageUsed) || 0) / 1e12 : 0;

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <h2 className="font-bold text-lg mb-1">Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Backup Overview</h1>
          <p className="text-slate-500 mt-1">Monitor and manage backup jobs and storage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Storage Used</p>
            <p className="text-2xl font-bold text-slate-900">
              {storageUsedTB.toFixed(2)} <span className="text-sm font-normal text-slate-500">TB</span>
            </p>
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Recent Backup Jobs</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{job.name}</div>
                      <div className="text-xs text-slate-500">{job.schedule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="font-medium">{job.sourceType}</span>: {job.sourceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                        job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        job.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canRunJobs && (
                        <button 
                          onClick={() => handleRunJob(job.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full"
                          title="Trigger execution"
                        >
                          <PlayCircle size={18} className="mr-1" /> Run
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No backup jobs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupDashboard;
