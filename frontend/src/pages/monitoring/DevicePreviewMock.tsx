import React, { useState } from 'react';
import { FULL_DEVICE_MOCK, FULL_DEVICE_MOCK_ALERTS, FULL_DEVICE_MOCK_TICKETS } from './fullDeviceMockFixture';
import { DeviceDetailWorkspace } from './components/DeviceDetailWorkspace';

const DevicePreviewMock = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* PROMINENT WARNING BANNER */}
      <div className="bg-amber-400 text-amber-900 px-6 py-3 font-semibold text-center text-sm border-b border-amber-500 z-50 shadow-sm relative">
        ⚠️ DEVELOPMENT PREVIEW — MOCK DATA ONLY — This page is for UI inspection only and must never appear in production navigation.
      </div>
      <div className="flex-1 overflow-auto">
        <DeviceDetailWorkspace
          device={FULL_DEVICE_MOCK}
          alerts={FULL_DEVICE_MOCK_ALERTS}
          tickets={FULL_DEVICE_MOCK_TICKETS}
          loadingAlerts={false}
          loadingTickets={false}
          onTabChange={setActiveTab}
          isMockPreview={true}
        />
      </div>
    </div>
  );
};

export default DevicePreviewMock;
