"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Rediriger si déjà connecté
        const token = localStorage.getItem('admin_token');
        if (token) router.push('/');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Check if user is admin
                if (data.user.role === 'admin') {
                    localStorage.setItem('admin_token', data.token);
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                    router.push('/');
                } else {
                    // Not an admin, redirect to user interface
                    setError('Accès refusé. Vous n\'êtes pas un administrateur.');
                    setTimeout(() => {
                        window.location.href = 'http://localhost:3000/auth/login';
                    }, 2000);
                }
            } else {
                setError(data.error || 'Identifiants invalides');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', color: 'white' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '440px', padding: '48px', borderRadius: 'var(--radius-lg)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-1px', marginBottom: '8px' }}>
                        KEMET <span style={{ color: 'var(--accent-primary)' }}>MANAGER</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Portail d'administration sécurisé</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>EMAIL PROFESSIONNEL</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                    padding: '12px 12px 12px 42px', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none'
                                }}
                                placeholder="nom@kemet.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>MOT DE PASSE</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                    padding: '12px 12px 12px 42px', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none'
                                }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: 'var(--accent-primary)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px',
                            boxShadow: '0 4px 20px rgba(31, 111, 92, 0.3)'
                        }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                        Se connecter
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Accès réservé au personnel Kemet autorisé.
                </div>
            </motion.div>
        </div>
    );
}
