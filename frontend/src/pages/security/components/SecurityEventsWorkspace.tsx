import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SecurityEventDetailModal } from './SecurityEventDetailModal';

interface Props {
  summary: any;
  eventsPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  fetchEventDetail: (id: string) => Promise<any>;
}

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export const SecurityEventsWorkspace: React.FC<Props> = ({ summary, eventsPage, loading, filters, onFilterChange, onPageChange, fetchEventDetail }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailData, setEventDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const hasEventsCapability = summary?.availableCapabilities?.some((c: any) => c.capability === 'SECURITY_EVENTS');

  const handleRowClick = async (id: string) => {
    setSelectedEventId(id);
    setDetailLoading(true);
    try {
      const data = await fetchEventDetail(id);
      setEventDetailData(data);
    } catch (e) {
      console.error(e);
      // Optional: show error toast here
      setSelectedEventId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedEventId(null);
    setEventDetailData(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value, page: 0 }); // reset to page 0 on filter change
  };

  const renderKpis = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Events</span>
        <span className="text-xl font-bold text-slate-900">{hasEventsCapability ? (summary?.totalEvents || 0) : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Open</span>
        <span className="text-xl font-bold text-amber-600">{hasEventsCapability ? (summary?.openEvents || 0) : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Critical</span>
        <span className="text-xl font-bold text-red-600">{hasEventsCapability ? (summary?.criticalEvents || 0) : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">High</span>
        <span className="text-xl font-bold text-orange-600">{hasEventsCapability ? (summary?.highEvents || 0) : 'N/A'}</span>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search events..." 
          className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <select 
        className="block border border-slate-300 rounded py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        value={filters.severity}
        onChange={(e) => handleFilterChange('severity', e.target.value)}
      >
        <option value="">Severity</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <select 
        className="block border border-slate-300 rounded py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="">Status</option>
        <option value="OPEN">Open</option>
        <option value="ACKNOWLEDGED">Acknowledged</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      
      <select 
        className="block border border-slate-300 rounded py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        value={filters.provider}
        onChange={(e) => handleFilterChange('provider', e.target.value)}
      >
        <option value="">Provider</option>
        {summary?.availableCapabilities?.find((c: any) => c.capability === 'SECURITY_EVENTS')?.providers?.map((p: string) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );

  const renderTable = () => {
    if (!hasEventsCapability) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Feature Unavailable</h3>
          <p className="text-slate-500">Security event monitoring is not available from connected providers.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-500">Loading security events...</p>
        </div>
      );
    }

    if (!eventsPage || eventsPage.content.length === 0) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No security events found.</h3>
          <p className="text-slate-500">There are no events matching the current filters.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventsPage.content.map((e: any) => (
                <tr 
                  key={e.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(e.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      e.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      e.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                      e.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{e.severity}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800 text-sm">{e.title}</div>
                    <div className="text-xs text-slate-500">{e.type}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-700 text-sm">{e.endpointHostname || '—'}</div>
                    <div className="text-xs text-slate-500 font-mono">{e.endpointIpAddress || ''}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-600">{e.source || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{e.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{timeAgo(e.detectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{eventsPage.pageable.offset + 1}</span> to <span className="font-bold text-slate-700">{Math.min(eventsPage.pageable.offset + eventsPage.size, eventsPage.totalElements)}</span> of <span className="font-bold text-slate-700">{eventsPage.totalElements}</span> results
          </div>
          <div className="flex space-x-1">
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={eventsPage.first}
              onClick={() => onPageChange(eventsPage.number - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={eventsPage.last}
              onClick={() => onPageChange(eventsPage.number + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col h-full space-y-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Security Events</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor and investigate security events across connected providers</p>
      </div>
      
      {renderKpis()}
      {renderFilters()}
      {renderTable()}

      {selectedEventId && (
        <SecurityEventDetailModal 
          event={eventDetailData} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};
