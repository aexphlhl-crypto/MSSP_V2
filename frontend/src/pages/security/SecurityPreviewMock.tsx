import React, { useState } from 'react';
import { SecurityDashboardWorkspace } from './components/SecurityDashboardWorkspace';

export const SecurityPreviewMock = () => {
  const mockCapabilities = [
    { capability: 'SECURITY_EVENTS', providers: ['CounterCraft', 'Wazuh'] },
    { capability: 'SECURITY_ENDPOINT', providers: ['CounterCraft'] },
    { capability: 'VULNERABILITY', providers: ['Wazuh'] },
    { capability: 'RISK_SCORE', providers: ['CounterCraft'] }
  ];

  const mockSummary = {
    totalEvents: 45,
    criticalEvents: 3,
    highEvents: 12,
    openEvents: 18,
    totalVulnerabilities: 124,
    criticalVulnerabilities: 12,
    mediumVulnerabilities: 45,
    lowVulnerabilities: 30,
    protectedEndpoints: 85,
    vulnerableEndpoints: 5,
    warningEndpoints: 8,
    unknownEndpoints: 2,
    availableCapabilities: mockCapabilities,
    recentEvents: [
      { id: '1', title: 'Suspicious Login Attempt', severity: 'CRITICAL', status: 'OPEN', source: 'CounterCraft', detectedAt: new Date().toISOString() },
      { id: '2', title: 'Malware Detected', severity: 'HIGH', status: 'OPEN', source: 'Wazuh', detectedAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    recentEndpoints: [
      { id: '1', hostname: 'WIN-SRV-01', ipAddress: '10.0.0.5', protectionStatus: 'PROTECTED', riskScore: 12, lastCheckAt: new Date().toISOString() },
      { id: '2', hostname: 'PC-USER-02', ipAddress: '10.0.0.12', protectionStatus: 'AT_RISK', riskScore: 85, lastCheckAt: new Date(Date.now() - 7200000).toISOString() }
    ]
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] overflow-hidden">
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center text-amber-800 text-xs font-bold uppercase tracking-wider z-50 shadow-sm flex items-center justify-center">
        <span className="animate-pulse mr-2 h-2 w-2 bg-amber-500 rounded-full inline-block"></span>
        DEVELOPMENT MOCK PREVIEW — DO NOT USE IN PRODUCTION
      </div>
      <div className="flex-1 overflow-auto">
        <SecurityDashboardWorkspace summary={mockSummary} isMockPreview={true} />
      </div>
    </div>
  );
};
