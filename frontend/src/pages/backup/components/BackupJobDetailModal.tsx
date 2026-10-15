import React from 'react';
import { X, Database, Calendar, Hash, Server, Activity } from 'lucide-react';

interface Props {
  job: any;
  loading?: boolean;
  onClose: () => void;
}

const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

export const BackupJobDetailModal: React.FC<Props> = ({ job, loading, onClose }) => {
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backup Job Details</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{job.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  Job Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Name</label>
                    <div className="text-sm font-medium text-slate-900">{job.name || '—'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                      job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      job.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Enabled</label>
                    <div className="text-sm font-medium text-slate-900">
                      {job.enabled ? <span className="text-emerald-600">Yes</span> : <span className="text-slate-500">No</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Server className="w-3 h-3 mr-1" />
                  Source & Storage
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Source Type</label>
                    <div className="text-sm text-slate-900">{job.sourceType || '—'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Source Name</label>
                    <div className="text-sm text-slate-900">{job.sourceName || '—'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Repository ID</label>
                    <div className="text-xs font-mono text-slate-900 break-all">{job.repositoryId || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule & Execution
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Schedule</label>
                    <div className="text-sm font-mono bg-slate-50 px-2 py-1 rounded inline-block text-slate-800">{job.schedule || '—'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Last Run</label>
                    <div className="text-sm text-slate-900">{formatDate(job.lastRunAt)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Next Run</label>
                    <div className="text-sm text-slate-900">{formatDate(job.nextRunAt)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Retention Days</label>
                    <div className="text-sm text-slate-900">{job.retentionDays != null ? job.retentionDays : '—'}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
