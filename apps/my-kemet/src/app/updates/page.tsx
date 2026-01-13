"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<any[]>([]);
    const [installing, setInstalling] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-login for demo if no token exists
        const initializeAndLoad = async () => {
            if (!api.token) {
                try {
                    await api.login('meric@kemet.com', 'password');
                } catch (err) {
                    console.error('Auto-login failed:', err);
                }
            }
            loadUpdates();
        };
        initializeAndLoad();
    }, []);

    const loadUpdates = async () => {
        try {
            setLoading(true);
            // Get vehicle ID from user (hardcoded for demo)
            const vehicleId = 'v1';
            const data = await api.getAvailableUpdates(vehicleId);
            setUpdates(data);
        } catch (err: any) {
            setError(err.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (campaignId: string, version: string) => {
        try {
            setInstalling(campaignId);
            setError('');
            setSuccess('');

            const vehicleId = 'v1';
            const result = await api.installUpdate(vehicleId, campaignId);

            setSuccess(result.message || `Mise à jour ${version} installée avec succès !`);

            // Reload updates after installation
            setTimeout(() => {
                loadUpdates();
                setSuccess('');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur d\'installation');
        } finally {
            setInstalling(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Chargement des mises à jour...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Mises à jour</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gardez votre Gezo à jour avec les dernières fonctionnalités.</p>
            </header>

            {error && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <AlertCircle size={20} />
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
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <CheckCircle size={20} />
                    {success}
                </div>
            )}

            {updates.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: '#10B981', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Votre Gezo est à jour</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Aucune mise à jour disponible pour le moment.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {updates.map((update) => (
                        <UpdateCard
                            key={update.campaign_id}
                            update={update}
                            installing={installing === update.campaign_id}
                            onInstall={() => handleInstall(update.campaign_id, update.campaign_name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const UpdateCard = ({ update, installing, onInstall }: any) => {
    const versionMatch = update.campaign_name.match(/(\d+\.\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : update.campaign_name;

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="glass-panel"
            style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                        Version {version}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        {new Date(update.created_at).toLocaleDateString('fr-FR')}
                    </div>
                </div>
                <button
                    onClick={onInstall}
                    disabled={installing}
                    style={{
                        background: installing ? 'var(--text-muted)' : 'var(--accent-primary)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        fontWeight: 600,
                        cursor: installing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px'
                    }}
                >
                    {installing ? (
                        <>
                            <Clock size={16} className="animate-spin" />
                            Installation...
                        </>
                    ) : (
                        <>
                            <Download size={16} />
                            Installer
                        </>
                    )}
                </button>
            </div>

            <div style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
            }}>
                {update.description || 'Améliorations de performance et corrections de bugs.'}
            </div>
        </motion.div>
    );
};
