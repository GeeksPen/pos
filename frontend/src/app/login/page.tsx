'use client';
import { useState } from 'react';
import api from '@/lib/axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            window.location.href = '/pos';
        } catch (err) {
            alert('Login failed. Check credentials.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
}
