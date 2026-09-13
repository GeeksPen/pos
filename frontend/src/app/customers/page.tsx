'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);

    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const fetchCustomers = () => {
        api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('balance', balance || '0');
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/customers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setName('');
            setBalance('');
            setImage(null);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert("Error creating customer");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Customers</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-4 gap-4">
                <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required className="border p-2"/>
                <input type="number" placeholder="Starting Balance" value={balance} onChange={e=>setBalance(e.target.value)} className="border p-2"/>
                <input type="file" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="border p-2"/>
                <button type="submit" className="bg-blue-600 text-white p-2">Add Customer</button>
            </form>

            <div className="bg-white shadow rounded-lg p-4">
                {customers.length === 0 ? <p>No customers</p> :
                    <ul>
                        {customers.map(c => (
                            <li key={c.id} className="flex items-center gap-4 py-2 border-b">
                                {c.image_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}/storage/${c.image_path}`} alt={c.name} className="w-12 h-12 object-cover rounded-full" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                )}
                                <div>
                                    <p className="font-bold">{c.name}</p>
                                    <p className={`text-sm ${c.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>Balance: ${c.balance}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </div>
    );
}
