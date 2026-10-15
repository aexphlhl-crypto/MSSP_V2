import React, { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useParams } from 'react-router-dom';

const AlertDetail = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/monitoring/alerts/${id}`)
      .then(res => setAlert(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = (action: 'acknowledge' | 'resolve') => {
    api.patch(`/monitoring/alerts/${id}/${action}`)
      .then(res => setAlert(res.data))
      .catch(err => window.alert(err.response?.data?.message || `Failed to ${action} alert`));
  };

  if (loading) return <LoadingSpinner />;
  if (!alert) return <div>Alert not found</div>;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Alert Details</h1>
        <div className="space-x-3">
          {alert.status === 'OPEN' && (
            <button 
              onClick={() => handleAction('acknowledge')}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-200"
            >
              Acknowledge
            </button>
          )}
          {(alert.status === 'OPEN' || alert.status === 'ACKNOWLEDGED') && (
            <button 
              onClick={() => handleAction('resolve')}
              className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-200"
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{alert.title}</h3>
          <span className={`mt-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
              alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' : 
              'bg-blue-100 text-blue-800'}`}>
            {alert.severity}
          </span>
          <span className="ml-3 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
            {alert.status}
          </span>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Message</h4>
          <p className="mt-1 text-sm text-gray-900">{alert.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Created</h4>
            <p className="mt-1 text-sm text-gray-900">{new Date(alert.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Acknowledged</h4>
            <p className="mt-1 text-sm text-gray-900">
              {alert.acknowledgedAt ? `${new Date(alert.acknowledgedAt).toLocaleString()} by ${alert.acknowledgedBy}` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
