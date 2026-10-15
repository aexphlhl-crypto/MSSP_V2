import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Clock,
  Search, Filter, ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { BackupAlertDetailModal } from './BackupAlertDetailModal';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  summary: any;
  alertsPage: any;
  loading: boolean;
  filters: any;
  onFilterChange: (f: any) => void;
  onPageChange: (p: number) => void;
  fetchAlertDetail: (id: string) => Promise<any>;
  onAcknowledge: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}

export const BackupAlertsWorkspace: React.FC<Props> = ({
  summary,
  alertsPage,
  loading,
  filters,
  onFilterChange,
  onPageChange,
  fetchAlertDetail,
  onAcknowledge,
  onResolve,
}) => {
  const { hasRole } = useAuthStore();
  const canAct = hasRole(['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN']);

  const [searchInput, setSearchInput]   = useState(filters.search || '');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError]   = useState<string | null>(null);

  useEffect(() => { setSearchInput(filters.search || ''); }, [filters.search]);

  // Debounced search
  useEffect(() => {
    const h = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput, page: 0 });
      }
    }, 400);
    return () => clearTimeout(h);
  }, [searchInput, filters, onFilterChange]);

  const openDetail = async (id: string) => {
    setModalLoading(true);
    setSelectedAlert({ id });
    try {
      const data = await fetchAlertDetail(id);
      setSelectedAlert(data);
    } catch (e) {
      console.error(e);
      setSelectedAlert(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAcknowledge = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionError(null);
    try {
      await onAcknowledge(id);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to acknowledge alert.');
    }
  };

  const handleResolve = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionError(null);
    try {
      await onResolve(id);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to resolve alert.');
    }
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">CRITICAL</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">WARNING</span>;
      case 'INFO':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">INFO</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{severity}</span>;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">OPEN</span>;
      case 'ACKNOWLEDGED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">ACKNOWLEDGED</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">RESOLVED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Backup Alerts</h1>
        <p className="text-slate-500 mt-1">Monitor and manage backup-related alerts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg mr-4">
            <Bell size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.total ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg mr-4">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Open</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.open ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg mr-4">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Acknowledged</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.acknowledged ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.resolved ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm flex items-center">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg mr-4">
            <Info size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Critical</p>
            <p className="text-2xl font-bold text-red-700">{summary?.critical ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Main Workspace */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-4 rounded-t-lg flex-wrap gap-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert title..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value, page: 0 })}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={filters.severity}
              onChange={(e) => onFilterChange({ ...filters, severity: e.target.value, page: 0 })}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}

          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white sticky top-0 z-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Related Job</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</th>
                {canAct && (
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {alertsPage?.content?.length > 0 ? (
                alertsPage.content.map((alert: any) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(alert.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{alert.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderSeverityBadge(alert.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(alert.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {alert.jobId ? alert.jobId.substring(0, 8) + '…' : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '—'}
                    </td>
                    {canAct && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {alert.status === 'OPEN' && (
                            <button
                              onClick={(e) => handleAcknowledge(e, alert.id)}
                              className="text-amber-600 hover:text-amber-900 text-xs border border-amber-300 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                              title="Acknowledge"
                            >
                              Ack
                            </button>
                          )}
                          {(alert.status === 'OPEN' || alert.status === 'ACKNOWLEDGED') && (
                            <button
                              onClick={(e) => handleResolve(e, alert.id)}
                              className="text-emerald-600 hover:text-emerald-900 text-xs border border-emerald-300 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                              title="Resolve"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canAct ? 7 : 6} className="px-6 py-12 text-center">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No backup alerts found</h3>
                    <p className="text-slate-500 mt-1">
                      {filters.search || filters.status || filters.severity
                        ? 'No backup alerts match your filters.'
                        : 'There are no backup alerts for this tenant.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {alertsPage && (() => {
          const totalElements = Number(alertsPage.totalElements) || 0;
          const totalPages    = Number(alertsPage.totalPages)    || 0;
          const pageNumber    = Number(alertsPage.number)        || 0;
          const pageSize      = Number(alertsPage.size)          || 25;
          const startItem     = totalElements === 0 ? 0 : (pageNumber * pageSize) + 1;
          const endItem       = Math.min((pageNumber + 1) * pageSize, totalElements);

          return (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-b-lg">
              <div className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-medium text-slate-900">{startItem}</span>{' '}
                to{' '}
                <span className="font-medium text-slate-900">{endItem}</span>{' '}
                of{' '}
                <span className="font-medium text-slate-900">{totalElements}</span>{' '}
                results
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

      {/* Detail Modal */}
      {selectedAlert && (
        <BackupAlertDetailModal
          alert={selectedAlert}
          loading={modalLoading}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};
