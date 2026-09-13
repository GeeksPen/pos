'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics')
           .then(res => {
               setAnalytics(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!analytics) return <div>Error loading dashboard. Ensure you are logged in.</div>;

    const chartData = [
        { name: 'Financials', Sales: analytics.total_sales, Profit: analytics.total_profit }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Analytics</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h2 className="text-gray-500 text-sm font-bold uppercase">Total Sales</h2>
                    <p className="text-3xl font-bold text-gray-900">${analytics.total_sales}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h2 className="text-gray-500 text-sm font-bold uppercase">Total Profit</h2>
                    <p className="text-3xl font-bold text-gray-900">${analytics.total_profit}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8 h-80">
                <h2 className="text-lg font-bold mb-4">Financial Overview</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Sales" fill="#3b82f6" />
                        <Bar dataKey="Profit" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-4">Recent Invoices</h2>
                <ul className="divide-y">
                    {analytics.recent_invoices.map((inv: any) => (
                        <li key={inv.id} className="py-2 flex justify-between">
                            <span>Invoice #{inv.id} - {inv.type}</span>
                            <span className="font-bold">${inv.total}</span>
                        </li>
                    ))}
                    {analytics.recent_invoices.length === 0 && <p>No recent invoices.</p>}
                </ul>
            </div>
        </div>
    );
}
