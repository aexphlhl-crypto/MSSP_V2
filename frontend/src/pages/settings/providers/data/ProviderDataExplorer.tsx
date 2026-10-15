import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProviderDataExplorer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Mock fetch
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                setData({
                    providerId: id,
                    rawPayload: {
                        timestamp: new Date().toISOString(),
                        events: [{ type: 'login', status: 'success', user: 'admin' }],
                        metrics: { cpu: 45, ram: 60 }
                    },
                    normalizedOutput: {
                        eventType: 'auth',
                        success: true,
                        username: 'admin',
                        resourceUsage: { cpuPercent: 45, memoryPercent: 60 }
                    }
                });
                setLoading(false);
            }, 500);
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-4">Loading data explorer...</div>;
    if (!data) return <div className="p-4">No data found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Provider Data Explorer ({id})</h1>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Raw Payload</h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-sm">
                        {JSON.stringify(data.rawPayload, null, 2)}
                    </pre>
                </div>
                <div className="bg-white p-4 shadow rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Normalized Output</h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-sm">
                        {JSON.stringify(data.normalizedOutput, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ProviderDataExplorer;
