"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { adminApi } from '../../lib/api';

export default function UpdatesPage() {
    const [deploying, setDeploying] = useState(false);
    const [version, setVersion] = useState('');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-login for demo or re-login if role is incorrect
        const initializeAdmin = async () => {
            try {
                let shouldLogin = !adminApi.token;

                if (adminApi.token) {
                    try {
                        const me = await adminApi.request('/auth/me');
                        if (me.role !== 'admin') {
                            adminApi.clearToken();
                            shouldLogin = true;
                        }
                    } catch (e) {
                        adminApi.clearToken();
                        shouldLogin = true;
                    }
                }

                if (shouldLogin) {
                    await adminApi.login('admin@kemet.com', 'password');
                }
            } catch (err) {
                console.error('Admin initialization failed:', err);
                setError('Erreur d\'authentification admin');
            }
        };
        initializeAdmin();
    }, []);

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!version || !notes) {
            setError('Version et notes sont requis');
            return;
        }

        setDeploying(true);
        setError('');
        setSuccess('');

        try {
            const result = await adminApi.deployUpdate(version, notes);
            setSuccess(result.message || `Mise à jour ${version} déployée avec succès !`);
            setVersion('');
            setNotes('');

            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du déploiement');
        } finally {
            setDeploying(false);
        }
    };


    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Gestion des Mises à jour</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Publiez des mises à jour FOTA (Firmware Over-The-Air) pour la flotte.</p>
            </header>

            {error && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#EF4444'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#10B981'
                }}>
                    {success}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Release Builder - Left Column */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UploadCloud size={20} style={{ color: 'var(--accent-primary)' }} />
                        Nouvelle Version
                    </h3>

                    <form onSubmit={handleDeploy} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <InputGroup
                                label="Version du Build"
                                placeholder="ex: 2.5.0"
                                value={version}
                                onChange={(e: any) => setVersion(e.target.value)}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Priorité</label>
                                <select style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '14px'
                                }}>
                                    <option>Normale</option>
                                    <option>Critique (Sécurité)</option>
                                    <option>Hotfix</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Notes de version (Public)</label>
                            <textarea
                                rows={6}
                                placeholder="- Amélioration de la gestion batterie..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px',
                                    color: 'white',
                                    width: '100%',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            ></textarea>
                        </div>

                        {/* Target Audience */}
                        <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>Cible de déploiement</label>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="radio" name="target" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
                                    <span style={{ fontSize: '14px' }}>Toute la flotte</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="radio" name="target" style={{ accentColor: 'var(--accent-primary)' }} />
                                    <span style={{ fontSize: '14px' }}>Beta Testeurs (Internal)</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={deploying}
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: deploying ? 'not-allowed' : 'pointer',
                                    opacity: deploying ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                {deploying ? 'Déploiement en cours...' : 'Publier la mise à jour'}
                                {!deploying && <UploadCloud size={18} />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Fragmentation & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Version Distribution Chart */}
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Fragmentation OS</h3>
                        <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            {/* Minimalist Bar Visualization */}
                            <div style={{ width: '100%', display: 'flex', height: '24px', borderRadius: '999px', overflow: 'hidden', marginBottom: '32px' }}>
                                <div style={{ width: '65%', background: 'var(--accent-primary)' }} />
                                <div style={{ width: '25%', background: '#FBBF24' }} />
                                <div style={{ width: '10%', background: '#3B82F6' }} />
                            </div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <LegendItem color="var(--accent-primary)" label="v2.4.1 (Stable)" value="65%" />
                                <LegendItem color="#FBBF24" label="v2.4.0" value="25%" />
                                <LegendItem color="#3B82F6" label="v2.3.x (Legacy)" value="10%" />
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Historique</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <HistoryItem version="v2.4.1" date="12 Jan 2026" status="success" />
                            <HistoryItem version="v2.4.0" date="20 Dec 2025" status="success" />
                            <HistoryItem version="v2.3.5" date="15 Nov 2025" status="warning" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

const InputGroup = ({ label, placeholder, value, onChange }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                color: 'white',
                width: '100%',
                fontSize: '14px'
            }}
        />
    </div>
);

const LegendItem = ({ color, label, value }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
    </div>
);

const HistoryItem = ({ version, date, status }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)', color: status === 'success' ? '#10B981' : '#FBBF24' }}>
                <Clock size={16} />
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{version}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{date}</div>
            </div>
        </div>
        <div>
            {status === 'success' ? <CheckCircle size={18} style={{ color: '#10B981' }} /> : <AlertCircle size={18} style={{ color: '#FBBF24' }} />}
        </div>
    </div>
);
