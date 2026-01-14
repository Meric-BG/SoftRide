"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function UserLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Auto-redirect removed to allow users to see the login/register flow even with stale tokens

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.login(email, password);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard (everyone lands here now as requested)
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '440px', padding: '48px', borderRadius: 'var(--radius-lg)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-1px', marginBottom: '8px' }}>MY KEMET</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Connectez-vous à votre véhicule</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                    padding: '14px 14px 14px 48px', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none'
                                }}
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                    padding: '14px 14px 14px 48px', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none'
                                }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '18px', background: 'var(--accent-primary)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px',
                            boxShadow: '0 4px 20px rgba(31, 111, 92, 0.4)'
                        }}
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <LogIn size={24} />}
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Pas encore membre ?{' '}
                    <Link href="/auth/register" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                        Créer un compte
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
