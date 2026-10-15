import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

interface Props {
  alert: any;
  loading: boolean;
  onClose: () => void;
}

const SeverityIcon = ({ severity }: { severity: string }) => {
  switch (severity) {
    case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'WARNING':  return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    default:         return <Bell className="w-5 h-5 text-blue-500" />;
  }
};

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-50 border-red-200 text-red-900',
  WARNING:  'bg-amber-50 border-amber-200 text-amber-900',
  INFO:     'bg-blue-50 border-blue-200 text-blue-900',
};

const statusColors: Record<string, string> = {
  OPEN:         'bg-red-100 text-red-800',
  ACKNOWLEDGED: 'bg-amber-100 text-amber-800',
  RESOLVED:     'bg-emerald-100 text-emerald-800',
};

export const BackupAlertDetailModal: React.FC<Props> = ({ alert, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {loading ? 'Loading…' : alert?.title || 'Alert Detail'}
              </h2>
              {!loading && alert?.id && (
                <p className="text-xs text-slate-400 font-mono">ID: {alert.id}</p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : alert ? (
            <div className="space-y-5">

              {/* Severity Banner */}
              <div className={`p-4 rounded-lg border flex items-start ${severityColors[alert.severity] || 'bg-slate-50 border-slate-200'}`}>
                <SeverityIcon severity={alert.severity} />
                <div className="ml-3">
                  <h3 className="text-sm font-bold">{alert.severity} Alert</h3>
                  <p className="text-sm mt-0.5">{alert.title}</p>
                </div>
              </div>

              {/* Status & Severity row */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[alert.status] || 'bg-slate-100 text-slate-800'}`}>
                    {alert.status}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Severity</span>
                  <span className="text-sm font-medium text-slate-900">{alert.severity}</span>
                </div>
              </div>

              {/* Message */}
              {alert.message && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
                    <FileText className="w-4 h-4 text-slate-500 mr-2" />
                    <h3 className="text-sm font-bold text-slate-800">Message</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              )}

              {/* Related Job */}
              {alert.jobId && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Related Job ID</span>
                  <span className="text-sm font-mono text-slate-900">{alert.jobId}</span>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
                  <Clock className="w-4 h-4 text-slate-500 mr-2" />
                  <h3 className="text-sm font-bold text-slate-800">Timeline</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Created</span>
                    <span className="text-sm text-slate-900">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Resolved</span>
                    <span className="text-sm text-slate-900">
                      {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Bell className="w-12 h-12 mb-3 text-slate-300" />
              <p>Alert details unavailable.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
