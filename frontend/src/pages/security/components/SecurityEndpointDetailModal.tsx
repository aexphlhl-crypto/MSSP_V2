import React from 'react';
import { X, Shield, Activity, Calendar, Hash, Globe, Lock } from 'lucide-react';

interface Props {
  endpoint: any;
  loading?: boolean;
  onClose: () => void;
}

const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

export const SecurityEndpointDetailModal: React.FC<Props> = ({ endpoint, loading, onClose }) => {
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!endpoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Endpoint Details</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{endpoint.id}</p>
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
                  Identity & Network
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Hostname</label>
                    <div className="text-sm font-medium text-slate-900">{endpoint.hostname || 'Unknown endpoint'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">IP Address</label>
                    <div className="text-sm font-mono text-slate-900">{endpoint.ipAddress || '—'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Security Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Protection Status</label>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded inline-block ${
                      endpoint.protectionStatus === 'PROTECTED' ? 'bg-green-100 text-green-700' :
                      endpoint.protectionStatus === 'UNPROTECTED' ? 'bg-red-100 text-red-700' : 
                      endpoint.protectionStatus === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {endpoint.protectionStatus || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Isolation Supported</label>
                    <div className="text-sm font-medium text-slate-900">
                      {endpoint.isolationSupported ? (
                        <span className="text-green-600 flex items-center"><Shield className="w-3 h-3 mr-1"/> Supported</span>
                      ) : (
                        <span className="text-slate-500">Not supported</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  Agent Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Agent Version</label>
                    <div className="text-sm text-slate-900">{endpoint.agentVersion || '—'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Risk Score</label>
                    <div className="text-sm text-slate-900 font-bold">
                      {endpoint.riskScore != null ? (
                        <span className={
                          endpoint.riskScore > 70 ? 'text-red-600' : 
                          endpoint.riskScore > 30 ? 'text-amber-600' : 
                          'text-green-600'
                        }>{endpoint.riskScore}</span>
                      ) : '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Activity
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Last Check At</label>
                    <div className="text-sm text-slate-900">{formatDate(endpoint.lastCheckAt)}</div>
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
