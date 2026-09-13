'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Products Management</h1>
            <div className="bg-white shadow rounded-lg p-4">
                {products.length === 0 ? <p>No products</p> :
                    <ul>{products.map(p => <li key={p.id}>{p.name} - ${p.selling_price}</li>)}</ul>
                }
            </div>
        </div>
    );
}
