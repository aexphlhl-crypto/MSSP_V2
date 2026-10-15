import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const Billing = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions/my-subscription')
      .then(res => {
        setSubscription(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!subscription) return <div>Failed to load subscription.</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Subscription & Billing</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 mb-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Plan</h3>
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {subscription.status}
          </span>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-3xl font-bold text-slate-900">{subscription.planName}</h4>
            {subscription.isPlatformAdmin && (
              <p className="text-sm text-blue-600 mt-1">Platform Admin accounts bypass normal subscription limits.</p>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-6">
            Started: {subscription.startAt ? new Date(subscription.startAt).toLocaleDateString() : 'N/A'}
          </div>

          <h5 className="text-md font-semibold text-gray-900 mb-3">Enabled Features:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subscription.features?.map((feat: string) => (
              <div key={feat} className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
