import React from 'react';
import { X, ShieldAlert, AlertTriangle, ShieldCheck, Clock, Server, Activity, Shield } from 'lucide-react';

interface Props {
  event: any;
  onClose: () => void;
}

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

export const SecurityEventDetailModal: React.FC<Props> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              event.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
              event.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
              event.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {event.severity === 'CRITICAL' ? <ShieldAlert className="w-5 h-5" /> :
               event.severity === 'HIGH' ? <AlertTriangle className="w-5 h-5" /> :
               <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{event.title}</h2>
              <p className="text-xs text-slate-500 font-medium">Event ID: {event.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Information */}
            <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-slate-400" /> Event Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Severity</span>
                  <span className="font-semibold text-slate-900 col-span-2">{event.severity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Status</span>
                  <span className="font-semibold text-slate-900 col-span-2">{event.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Type</span>
                  <span className="font-semibold text-slate-900 col-span-2">{event.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Detected</span>
                  <span className="font-semibold text-slate-900 col-span-2">{formatDate(event.detectedAt)} <span className="text-slate-400 font-normal">({timeAgo(event.detectedAt)})</span></span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-500 font-medium col-span-1">Created</span>
                  <span className="font-semibold text-slate-900 col-span-2">{formatDate(event.createdAt)}</span>
                </div>
                {event.resolvedAt && (
                  <div className="grid grid-cols-3 gap-2 text-sm border-t border-slate-100 pt-2">
                    <span className="text-slate-500 font-medium col-span-1">Resolved</span>
                    <span className="font-semibold text-emerald-600 col-span-2">{formatDate(event.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Source Information */}
            <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                <Server className="w-4 h-4 mr-2 text-slate-400" /> Source Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Provider</span>
                  <span className="font-semibold text-slate-900 col-span-2">{event.source || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium col-span-1">Hostname</span>
                  <span className="font-semibold text-slate-900 col-span-2">{event.endpointHostname || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-500 font-medium col-span-1">IP Address</span>
                  <span className="font-mono text-slate-900 col-span-2">{event.endpointIpAddress || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-slate-400" /> Description
            </h3>
            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded border border-slate-100 font-mono">
              {event.description || 'No description available for this event.'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
