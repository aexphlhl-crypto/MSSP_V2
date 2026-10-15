import React from 'react';
import { useUserStore } from '../store/userStore';

const Profile = () => {
  const user = useUserStore();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {user.status}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tenant</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.tenantName} ({user.tenantIdentifier})</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
