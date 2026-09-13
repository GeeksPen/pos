'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [invoiceType, setInvoiceType] = useState('sale');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/products'), api.get('/customers')])
        .then(([p, c]) => {
            setProducts(p.data);
            setCustomers(c.data);
            setLoading(false);
        });
    }, []);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const submitInvoice = async () => {
        if (!cart.length) return alert('Cart empty');
        try {
            await api.post('/invoices', {
                customer_id: selectedCustomer || null,
                type: invoiceType,
                items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.selling_price }))
            });
            alert('Invoice submitted');
            setCart([]);
        } catch(e) {
            alert('Error');
        }
    };

    if(loading) return <p>Loading...</p>;

    return (
        <div className="flex gap-4">
            <div className="w-1/2 p-4 border">
                <h2 className="font-bold">Products</h2>
                {products.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)} className="block p-2 border m-2 w-full text-left">
                        {p.name} - ${p.selling_price}
                    </button>
                ))}
            </div>
            <div className="w-1/2 p-4 border">
                <h2 className="font-bold">Cart</h2>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full border p-2 mb-2">
                    <option value="">Walk-in</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)} className="w-full border p-2 mb-4">
                    <option value="sale">Sale</option>
                    <option value="return">Return</option>
                    <option value="purchase">Purchase</option>
                </select>
                <ul>
                    {cart.map((c, i) => <li key={i}>{c.product.name} x{c.quantity}</li>)}
                </ul>
                <button onClick={submitInvoice} className="w-full bg-blue-500 text-white p-2 mt-4">Submit Invoice</button>
            </div>
        </div>
    );
}
