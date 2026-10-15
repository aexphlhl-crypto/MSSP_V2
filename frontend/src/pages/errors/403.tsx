import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-amber-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">
          This feature is either not included in your current subscription plan or you do not have permission to view it.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
