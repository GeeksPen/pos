'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);

    // form states
    const [name, setName] = useState('');
    const [buyingPrice, setBuyingPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const fetchProducts = () => {
        api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('buying_price', buyingPrice);
        formData.append('selling_price', sellingPrice);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setName('');
            setBuyingPrice('');
            setSellingPrice('');
            setImage(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert("Error creating product");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Products Management</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-5 gap-4">
                <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required className="border p-2"/>
                <input type="number" placeholder="Buying Price" value={buyingPrice} onChange={e=>setBuyingPrice(e.target.value)} required className="border p-2"/>
                <input type="number" placeholder="Selling Price" value={sellingPrice} onChange={e=>setSellingPrice(e.target.value)} required className="border p-2"/>
                <input type="file" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="border p-2"/>
                <button type="submit" className="bg-blue-600 text-white p-2">Add Product</button>
            </form>

            <div className="bg-white shadow rounded-lg p-4">
                {products.length === 0 ? <p>No products</p> :
                    <ul>
                        {products.map(p => (
                            <li key={p.id} className="flex items-center gap-4 py-2 border-b">
                                {p.image_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}/storage/${p.image_path}`} alt={p.name} className="w-12 h-12 object-cover rounded" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                                )}
                                <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-sm">Sell: ${p.selling_price} | Buy: ${p.buying_price}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </div>
    );
}
