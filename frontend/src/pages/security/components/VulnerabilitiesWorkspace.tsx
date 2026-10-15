import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import { VulnerabilityDetailModal } from './VulnerabilityDetailModal';

interface Props {
  summary: any;
  vulnerabilitiesPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  fetchVulnerabilityDetail: (id: string) => Promise<any>;
}

const timeAgo = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export const VulnerabilitiesWorkspace: React.FC<Props> = ({ 
  summary, 
  vulnerabilitiesPage, 
  loading, 
  filters, 
  onFilterChange, 
  onPageChange, 
  fetchVulnerabilityDetail 
}) => {
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  const hasCapability = summary?.availableCapabilities?.some((c: any) => c.capability === 'VULNERABILITY');

  const handleRowClick = async (id: string) => {
    setSelectedVulnerabilityId(id);
    try {
      const data = await fetchVulnerabilityDetail(id);
      setDetailData(data);
    } catch (e) {
      console.error(e);
      setSelectedVulnerabilityId(null);
    }
  };

  const closeModal = () => {
    setSelectedVulnerabilityId(null);
    setDetailData(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value, page: 0 }); // reset to page 0 on filter change
  };

  const renderKpis = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Vulnerabilities</span>
        <span className="text-xl font-bold text-slate-900">{hasCapability ? (summary?.totalVulnerabilities ?? 'N/A') : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Critical</span>
        <span className="text-xl font-bold text-red-600">{hasCapability ? (summary?.criticalVulnerabilities ?? 'N/A') : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Medium</span>
        <span className="text-xl font-bold text-amber-500">{hasCapability ? (summary?.mediumVulnerabilities ?? 'N/A') : 'N/A'}</span>
      </div>
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Low</span>
        <span className="text-xl font-bold text-blue-500">{hasCapability ? (summary?.lowVulnerabilities ?? 'N/A') : 'N/A'}</span>
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
          placeholder="Search vulnerabilities..." 
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
        <option value="">All Severities</option>
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
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="RESOLVED">Resolved</option>
        <option value="MITIGATED">Mitigated</option>
        <option value="IGNORED">Ignored</option>
      </select>
    </div>
  );

  const renderTable = () => {
    if (!hasCapability) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Feature Unavailable</h3>
          <p className="text-slate-500">Vulnerability management is not available from connected providers.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-500">Loading vulnerabilities...</p>
        </div>
      );
    }

    if (!vulnerabilitiesPage || vulnerabilitiesPage.content.length === 0) {
      return (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No vulnerabilities found.</h3>
          <p className="text-slate-500">There are no vulnerabilities matching the current filters.</p>
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
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vulnerability</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVE</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVSS</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vulnerabilitiesPage.content.map((v: any) => (
                <tr 
                  key={v.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(v.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      v.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      v.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                      v.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{v.severity}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800 text-sm max-w-xs truncate" title={v.title}>{v.title}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono text-xs text-slate-600">{v.cveId || '—'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-xs text-slate-700">{v.cvssScore ?? 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-700 text-sm">{v.endpointHostname || 'Unknown endpoint'}</div>
                    <div className="text-xs text-slate-500 font-mono">{v.endpointIpAddress || ''}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{v.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{timeAgo(v.detectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{vulnerabilitiesPage.pageable.offset + 1}</span> to <span className="font-bold text-slate-700">{Math.min(vulnerabilitiesPage.pageable.offset + vulnerabilitiesPage.size, vulnerabilitiesPage.totalElements)}</span> of <span className="font-bold text-slate-700">{vulnerabilitiesPage.totalElements}</span> vulnerabilities
          </div>
          <div className="flex space-x-1">
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={vulnerabilitiesPage.first}
              onClick={() => onPageChange(vulnerabilitiesPage.number - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={vulnerabilitiesPage.last}
              onClick={() => onPageChange(vulnerabilitiesPage.number + 1)}
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
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Vulnerabilities</h1>
        <p className="text-slate-500 text-sm mt-0.5">Identify and investigate endpoint vulnerabilities across connected providers</p>
      </div>
      
      {renderKpis()}
      {renderFilters()}
      {renderTable()}

      {selectedVulnerabilityId && (
        <VulnerabilityDetailModal 
          vulnerability={detailData} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};
