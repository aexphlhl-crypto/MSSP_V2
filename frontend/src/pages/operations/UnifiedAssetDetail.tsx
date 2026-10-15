import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const UnifiedAssetDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    
    const handleActionExecute = () => {
        // Mock action execution
        alert(`Executed ${selectedAction} on Asset ${id}. Awaiting approval.`);
        setActionModalOpen(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Unified Asset Detail: {id}</h1>
                <button 
                    onClick={() => setActionModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
                >
                    Execute Provider Action
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monitoring Panel */}
                <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-3 text-blue-600 border-b pb-2">Monitoring</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Status</span><span className="text-green-500 font-bold">Online</span></div>
                        <div className="flex justify-between"><span>CPU Usage</span><span>45%</span></div>
                        <div className="flex justify-between"><span>Memory Usage</span><span>60%</span></div>
                        <div className="flex justify-between"><span>Uptime</span><span>14 days, 2 hrs</span></div>
                    </div>
                </div>

                {/* Security Panel */}
                <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-3 text-red-600 border-b pb-2">Security</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Vulnerabilities</span><span className="text-red-500 font-bold">2 Critical</span></div>
                        <div className="flex justify-between"><span>Last Scan</span><span>2 hours ago</span></div>
                        <div className="flex justify-between"><span>Endpoint Agent</span><span className="text-green-500">Active</span></div>
                    </div>
                </div>

                {/* Backup Panel */}
                <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-3 text-green-600 border-b pb-2">Backup & Recovery</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Last Backup</span><span className="text-green-500">Successful (1 hr ago)</span></div>
                        <div className="flex justify-between"><span>RPO Status</span><span className="text-green-500">Met</span></div>
                        <div className="flex justify-between"><span>Next Scheduled</span><span>In 11 hrs</span></div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {actionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Execute Action</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Action</label>
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={selectedAction}
                                onChange={e => setSelectedAction(e.target.value)}
                            >
                                <option value="">-- Select an Action --</option>
                                <option value="restart_service">Restart Service</option>
                                <option value="trigger_backup">Trigger Manual Backup</option>
                                <option value="isolate_endpoint">Isolate Endpoint (Security)</option>
                                <option value="apply_patch">Apply Critical Patch</option>
                            </select>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-4 border border-yellow-200">
                            <strong>Note:</strong> Some actions require multi-party approval before they are fully executed on the provider side.
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setActionModalOpen(false)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleActionExecute}
                                disabled={!selectedAction}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Request Execution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedAssetDetail;
