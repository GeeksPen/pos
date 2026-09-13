'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        api.get('/invoices')
           .then(res => setInvoices(res.data))
           .catch(err => console.error("Error fetching invoices. Ensure you are logged in.", err));
    }, []);

    const handlePrint = async (id: number) => {
        try {
            const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            console.error(e);
            alert("Error generating PDF.");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Invoices History</h1>
            <div className="bg-white shadow rounded-lg p-4">
                {invoices.length === 0 ? <p>No invoices found. Ensure you are logged in and have created some.</p> :
                    <ul className="divide-y">
                        {invoices.map(inv => (
                            <li key={inv.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Invoice #{inv.id} - {inv.type.toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">Total: ${inv.total}</p>
                                    <p className="text-sm text-gray-500">Customer: {inv.customer ? inv.customer.name : 'Walk-in'}</p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handlePrint(inv.id)}
                                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                    >
                                        Download PDF
                                    </button>
                                    {inv.qr_code && (
                                        <img src={`data:image/svg+xml;base64,${inv.qr_code}`} alt="QR Code" className="w-16 h-16 inline-block ml-2 border" />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </div>
    );
}
