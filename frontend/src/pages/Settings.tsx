import React, { useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'users', label: 'Users' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded-lg border border-gray-100 min-h-[400px]">
        <EmptyState 
          title={`${tabs.find(t => t.id === activeTab)?.label} Settings`}
          description="This section is a foundation placeholder and will be implemented in future phases."
        />
      </div>
    </div>
  );
};

export default Settings;
