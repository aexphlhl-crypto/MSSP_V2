import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldCheck, Info } from 'lucide-react';
import { SecurityEndpointDetailModal } from './SecurityEndpointDetailModal';

interface Props {
  summary: any;
  endpointsPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  fetchEndpointDetail: (id: string) => Promise<any>;
}

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export const SecurityEndpointsWorkspace: React.FC<Props> = ({ summary, endpointsPage, loading, filters, onFilterChange, onPageChange, fetchEndpointDetail }) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [endpointDetailData, setEndpointDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const hasEndpointCapability = summary?.availableCapabilities?.some((c: any) => c.capability === 'SECURITY_ENDPOINT');

  const handleRowClick = async (id: string) => {
    setSelectedEndpointId(id);
    setDetailLoading(true);
    try {
      const data = await fetchEndpointDetail(id);
      setEndpointDetailData(data);
    } catch (e) {
      console.error(e);
      setSelectedEndpointId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedEndpointId(null);
    setEndpointDetailData(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value, page: 0 }); // reset to page 0 on filter change
  };

  const renderKpis = () => {
    const protectedCount = summary?.protectedEndpoints || 0;
    const unprotectedCount = summary?.vulnerableEndpoints || 0; 
    const warningCount = summary?.warningEndpoints || 0;
    const unknownCount = summary?.unknownEndpoints || 0;
    const totalCount = protectedCount + unprotectedCount + warningCount + unknownCount;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Endpoints</span>
          <span className="text-xl font-bold text-slate-900">{hasEndpointCapability ? totalCount : 'N/A'}</span>
        </div>
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Protected</span>
          <span className="text-xl font-bold text-green-600">{hasEndpointCapability ? protectedCount : 'N/A'}</span>
        </div>
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Unprotected</span>
          <span className="text-xl font-bold text-red-600">{hasEndpointCapability ? unprotectedCount : 'N/A'}</span>
        </div>
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Warning</span>
          <span className="text-xl font-bold text-amber-600">{hasEndpointCapability ? warningCount : 'N/A'}</span>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search endpoints..." 
          className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <select 
        className="block border border-slate-300 rounded py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        value={filters.protectionStatus || ''}
        onChange={(e) => handleFilterChange('protectionStatus', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="PROTECTED">Protected</option>
        <option value="UNPROTECTED">Unprotected</option>
        <option value="WARNING">Warning</option>
        <option value="UNKNOWN">Unknown</option>
      </select>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PROTECTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-green-100 text-green-700">Protected</span>;
      case 'UNPROTECTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700">Unprotected</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">Warning</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

  const renderTable = () => {
    if (!hasEndpointCapability) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Feature Unavailable</h3>
          <p className="text-slate-500">Endpoint monitoring is not available from connected providers.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-500">Loading security endpoints...</p>
        </div>
      );
    }

    if (!endpointsPage || !endpointsPage.content || endpointsPage.content.length === 0) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No security endpoints found.</h3>
          <p className="text-slate-500">There are no endpoints matching the current filters.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hostname</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protection Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent Version</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpointsPage.content.map((e: any) => (
                <tr 
                  key={e.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(e.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800 text-sm">{e.hostname || 'Unknown endpoint'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-slate-600 font-mono">{e.ipAddress || '—'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(e.protectionStatus)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.agentVersion || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.riskScore != null ? e.riskScore : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{timeAgo(e.lastCheckAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{endpointsPage.pageable.offset + 1}</span> to <span className="font-bold text-slate-700">{Math.min(endpointsPage.pageable.offset + endpointsPage.size, endpointsPage.totalElements)}</span> of <span className="font-bold text-slate-700">{endpointsPage.totalElements}</span> endpoints
          </div>
          <div className="flex space-x-1">
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={endpointsPage.first}
              onClick={() => onPageChange(endpointsPage.number - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={endpointsPage.last}
              onClick={() => onPageChange(endpointsPage.number + 1)}
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
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Security Endpoints</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor and investigate endpoint security status</p>
      </div>
      
      {renderKpis()}
      {renderFilters()}
      {renderTable()}

      {selectedEndpointId && (
        <SecurityEndpointDetailModal 
          endpoint={endpointDetailData} 
          loading={detailLoading}
          onClose={closeModal} 
        />
      )}
    </div>
  );
};
