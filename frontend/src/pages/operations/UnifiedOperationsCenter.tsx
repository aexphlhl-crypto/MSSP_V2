import React, { useState, useMemo } from 'react';

const MOCK_DATA: any[] = [];

const METRICS_PAYLOAD = {
    sla: { value: '', status: '', source: '', state: '', missing: true },
    rpo: { value: '', status: '', source: '', state: '', missing: true },
    rto: { value: '', status: '', source: '', state: '', missing: true }
};

const UnifiedOperationsCenter: React.FC = () => {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
    const [copilotInput, setCopilotInput] = useState<string>('');
    const [copilotMessages, setCopilotMessages] = useState<{role: string, text: string}[]>([
        { role: 'assistant', text: 'Hello! I am your MSP Copilot. How can I help you analyze operations today?' }
    ]);
    const [data] = useState(MOCK_DATA);
    const [metrics] = useState(METRICS_PAYLOAD);

    // Filters
    const [filterFreshness, setFilterFreshness] = useState<string>('All');
    const [filterProvider, setFilterProvider] = useState<string>('All');
    const [filterSeverity, setFilterSeverity] = useState<string>('All');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (filterFreshness !== 'All' && item.freshness !== filterFreshness) return false;
            if (filterProvider !== 'All' && item.provider !== filterProvider) return false;
            if (filterSeverity !== 'All' && item.severity !== filterSeverity) return false;
            return true;
        });
    }, [data, filterFreshness, filterProvider, filterSeverity]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const refreshData = () => {
        setLastUpdated(new Date());
        setCurrentPage(1);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Unified Operations Center</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button onClick={refreshData} className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
                        Refresh
                    </button>
                    <button onClick={() => setCopilotOpen(!copilotOpen)} className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700">
                        {copilotOpen ? 'Close Copilot' : 'Open Copilot'}
                    </button>
                </div>
            </div>

            {/* SLA/RPO/RTO Dashboard Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${metrics.sla.missing ? 'border-gray-300' : 'border-green-500'}`}>
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Overall SLA</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className={`text-3xl font-bold ${metrics.sla.missing ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {metrics.sla.missing ? 'NOT_AVAILABLE' : metrics.sla.value}
                        </span>
                        {!metrics.sla.missing && <span className="ml-2 text-sm text-green-600">{metrics.sla.status}</span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                        <span className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded mr-1">Source: {metrics.sla.source}</span>
                        <span className={`px-1 py-0.5 rounded ${metrics.sla.state === 'REAL' ? 'bg-green-100 text-green-800' : metrics.sla.state === 'MOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{metrics.sla.state}</span>
                    </div>
                </div>
                <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${metrics.rpo.missing ? 'border-gray-300' : 'border-yellow-500'}`}>
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Avg RPO</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className={`text-3xl font-bold ${metrics.rpo.missing ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {metrics.rpo.missing ? 'NOT_AVAILABLE' : metrics.rpo.value}
                        </span>
                        {!metrics.rpo.missing && <span className="ml-2 text-sm text-yellow-600">{metrics.rpo.status}</span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                        <span className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded mr-1">Source: {metrics.rpo.source}</span>
                        <span className={`px-1 py-0.5 rounded ${metrics.rpo.state === 'REAL' ? 'bg-green-100 text-green-800' : metrics.rpo.state === 'MOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{metrics.rpo.state}</span>
                    </div>
                </div>
                <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${metrics.rto.missing ? 'border-gray-300' : 'border-blue-500'}`}>
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Avg RTO</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className={`text-3xl font-bold ${metrics.rto.missing ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {metrics.rto.missing ? 'NOT_AVAILABLE' : metrics.rto.value}
                        </span>
                        {!metrics.rto.missing && <span className="ml-2 text-sm text-blue-600">{metrics.rto.status}</span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                        <span className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded mr-1">Source: {metrics.rto.source}</span>
                        <span className={`px-1 py-0.5 rounded ${metrics.rto.state === 'REAL' ? 'bg-green-100 text-green-800' : metrics.rto.state === 'MOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{metrics.rto.state}</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                    <label className="font-semibold text-gray-700">Freshness:</label>
                    <select 
                        className="border rounded p-1"
                        value={filterFreshness}
                        onChange={(e) => { setFilterFreshness(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All</option>
                        <option value="Fresh">Fresh</option>
                        <option value="Stale">Stale</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="font-semibold text-gray-700">Provider:</label>
                    <select 
                        className="border rounded p-1"
                        value={filterProvider}
                        onChange={(e) => { setFilterProvider(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All</option>
                        <option value="AWS">AWS</option>
                        <option value="Veeam">Veeam</option>
                        <option value="Datadog">Datadog</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="font-semibold text-gray-700">Severity:</label>
                    <select 
                        className="border rounded p-1"
                        value={filterSeverity}
                        onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All</option>
                        <option value="Critical">Critical</option>
                        <option value="Warning">Warning</option>
                        <option value="Info">Info</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freshness/State</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.provider}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                        item.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {item.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.dataSource}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-col space-y-1">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${
                                        item.freshness === 'Fresh' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.freshness}
                                    </span>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${
                                        item.dataState === 'REAL' ? 'bg-green-100 text-green-800' : 
                                        item.dataState === 'MOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.dataState}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.time).toLocaleString()}</td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No data matches the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copilot Sliding Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${copilotOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            MSP Copilot
                        </h2>
                        <button onClick={() => setCopilotOpen(false)} className="text-white hover:text-gray-200">
                            &times;
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                        {copilotMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-white border-t border-gray-200">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if(!copilotInput.trim()) return;
                            const newMsg = { role: 'user', text: copilotInput };
                            setCopilotMessages(prev => [...prev, newMsg, { role: 'assistant', text: 'Analyzing your request...' }]);
                            setCopilotInput('');
                        }} className="flex space-x-2">
                            <input 
                                type="text" 
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" 
                                placeholder="Ask Copilot..." 
                                value={copilotInput}
                                onChange={(e) => setCopilotInput(e.target.value)}
                            />
                            <button type="submit" className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedOperationsCenter;

