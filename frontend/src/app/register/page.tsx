'use client';
import { useState } from 'react';
import api from '@/lib/axios';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/register', { name, email, password });
            localStorage.setItem('token', res.data.access_token);
            window.location.href = '/pos';
        } catch (err) {
            alert('Registration failed.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form onSubmit={handleRegister}>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full p-2 border rounded" required minLength={8} />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
}
