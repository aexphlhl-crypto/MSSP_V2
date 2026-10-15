import React from 'react';
import { X, HardDrive, Info, Activity, Clock } from 'lucide-react';

interface Props {
  repository: any;
  loading: boolean;
  onClose: () => void;
}

const formatBytes = (bytes: number) => {
  if (bytes === undefined || bytes === null) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BackupRepositoryDetailModal: React.FC<Props> = ({ repository, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {loading ? 'Loading...' : repository?.name || 'Repository Detail'}
              </h2>
              {!loading && repository && (
                <p className="text-sm text-slate-500">ID: {repository.id}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : repository ? (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border flex items-start ${
                repository.status === 'ONLINE' ? 'bg-emerald-50 border-emerald-200' :
                repository.status === 'OFFLINE' ? 'bg-red-50 border-red-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <Activity className={`w-5 h-5 mr-3 mt-0.5 ${
                  repository.status === 'ONLINE' ? 'text-emerald-600' :
                  repository.status === 'OFFLINE' ? 'text-red-600' :
                  'text-amber-600'
                }`} />
                <div>
                  <h3 className={`text-sm font-bold ${
                    repository.status === 'ONLINE' ? 'text-emerald-900' :
                    repository.status === 'OFFLINE' ? 'text-red-900' :
                    'text-amber-900'
                  }`}>
                    Repository Status: {repository.status}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    repository.status === 'ONLINE' ? 'text-emerald-700' :
                    repository.status === 'OFFLINE' ? 'text-red-700' :
                    'text-amber-700'
                  }`}>
                    {repository.status === 'ONLINE' ? 'The repository is online and available.' :
                     repository.status === 'OFFLINE' ? 'The repository is currently offline and unavailable.' :
                     'The repository has a warning condition requiring attention.'}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
                  <Info className="w-4 h-4 text-slate-500 mr-2" />
                  <h3 className="text-sm font-bold text-slate-800">Repository Information</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</span>
                    <span className="text-sm text-slate-900 font-medium">{repository.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Type</span>
                    <span className="text-sm text-slate-900">{repository.type}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Endpoint</span>
                    <span className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">{repository.endpoint || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Storage Details */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
                  <HardDrive className="w-4 h-4 text-slate-500 mr-2" />
                  <h3 className="text-sm font-bold text-slate-800">Storage Information</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Capacity</span>
                      <span className="text-lg font-bold text-slate-900">{formatBytes(repository.capacityBytes)}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Used Space</span>
                      <span className="text-lg font-bold text-slate-900">{formatBytes(repository.usedBytes)}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Free Space</span>
                      <span className="text-lg font-bold text-slate-900">
                        {repository.capacityBytes && repository.usedBytes !== undefined
                          ? formatBytes(repository.capacityBytes - repository.usedBytes)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {repository.capacityBytes > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Usage</span>
                        <span className="font-medium text-slate-700">
                          {Math.round(((repository.usedBytes || 0) / repository.capacityBytes) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            ((repository.usedBytes || 0) / repository.capacityBytes) > 0.9 ? 'bg-red-500' :
                            ((repository.usedBytes || 0) / repository.capacityBytes) > 0.75 ? 'bg-amber-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, ((repository.usedBytes || 0) / repository.capacityBytes) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
                  <Clock className="w-4 h-4 text-slate-500 mr-2" />
                  <h3 className="text-sm font-bold text-slate-800">Timing Details</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Last Checked</span>
                    <span className="text-sm text-slate-900">
                      {repository.lastCheckAt ? new Date(repository.lastCheckAt).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <HardDrive className="w-12 h-12 mb-3 text-slate-300" />
              <p>Repository details unavailable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
