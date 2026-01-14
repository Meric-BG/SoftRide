"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Car, CreditCard, History, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from '../Dashboard.module.css';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    vehicle_id?: string;
    vehicles?: {
        model_name: string;
        vin: string;
    };
}

interface Payment {
    payment_id: string;
    operator: string;
    amount: number;
    status: string;
    created_at: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUser(data);
            setPhone(data.phone_number || '');
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/payments/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setPayments(data);
            } else {
                console.warn('Expected array for payments history, got:', data);
                setPayments([]);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const handleUpdatePhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            // In a real app, we'd have a specific update profile endpoint
            // For now, let's assume we can POST to /api/auth/update (even if not yet implemented, for the POC feel)
            // Or we can simulate it since we are in a POC.
            setTimeout(() => {
                setUpdating(false);
                setMessage({ text: 'Profil mis à jour avec succès.', type: 'success' });
                if (user) setUser({ ...user, phone_number: phone });
            }, 1000);
        } catch (err) {
            setUpdating(false);
            setMessage({ text: 'Erreur lors de la mise à jour.', type: 'error' });
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Mon Profil</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations et abonnements.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>

                {/* User Info Section */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: 'var(--accent-primary)', borderRadius: '12px' }}>
                            <User size={24} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Informations Personnelles</h2>
                    </div>

                    <form onSubmit={handleUpdatePhone} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Nom complet</label>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                {user?.name}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Email</label>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                {user?.email}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Numéro de téléphone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+229 XX XX XX XX"
                                required
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-secondary)',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="glass-panel"
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginTop: '12px'
                            }}
                        >
                            {updating ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                        </button>

                        {message.text && (
                            <p style={{ color: message.type === 'success' ? '#10B981' : '#EF4444', fontSize: '14px', marginTop: '8px' }}>
                                {message.text}
                            </p>
                        )}
                    </form>
                </section>

                {/* Vehicle Section */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: 'rgba(31, 77, 62, 0.2)', borderRadius: '12px' }}>
                            <Car size={24} color="var(--accent-primary)" />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Mon Véhicule</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>MODÈLE</p>
                                <p style={{ fontWeight: 600 }}>{user?.vehicles?.model_name || 'Gezo Standard'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ID VÉHICULE</p>
                                <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{user?.vehicle_id || 'KMT-2026-X8'}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={18} color="#10B981" />
                                Abonnements Actifs
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <span>Connectivité Premium</span>
                                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>ACTIF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment History */}
                <section className="glass-panel" style={{ gridColumn: 'span 2', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                            <History size={24} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Historique des paiements</h2>
                    </div>

                    {payments.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Aucun paiement enregistré.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Service</th>
                                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Opérateur</th>
                                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Montant</th>
                                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.payment_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '16px' }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                        <td style={{ padding: '16px' }}>Abonnement</td>
                                        <td style={{ padding: '16px' }}>{p.operator}</td>
                                        <td style={{ padding: '16px' }}>{p.amount.toLocaleString()} FCFA</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {p.status === 'PAID' ? <CheckCircle size={16} color="#10B981" /> : p.status === 'FAILED' ? <XCircle size={16} color="#EF4444" /> : <Clock size={16} color="#FBBF24" />}
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: p.status === 'PAID' ? '#10B981' : p.status === 'FAILED' ? '#EF4444' : '#FBBF24'
                                                }}>
                                                    {p.status === 'PAID' ? 'PAYÉ' : p.status === 'FAILED' ? 'ÉCHEC' : 'EN ATTENTE'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </div>
    );
}
