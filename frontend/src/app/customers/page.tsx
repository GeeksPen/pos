'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Customers</h1>
            <div className="bg-white shadow rounded-lg p-4">
                {customers.length === 0 ? <p>No customers</p> :
                    <ul>{customers.map(c => <li key={c.id} className={c.balance < 0 ? 'text-red-500' : ''}>{c.name} - Balance: ${c.balance}</li>)}</ul>
                }
            </div>
        </div>
    );
}
