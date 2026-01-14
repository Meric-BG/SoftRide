"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, Shield, Eye, Smartphone, Database, Headphones, Moon, Download, CheckCircle, Clock, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
    const [updates, setUpdates] = useState<any[]>([]);
    const [installing, setInstalling] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingUpdates, setLoadingUpdates] = useState(true);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [currentVersion, setCurrentVersion] = useState('2.4.1');

    useEffect(() => {
        loadUpdates();

        // Subscribe to new updates
        const channel = supabase
            .channel('public:software_updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'software_updates' },
                (payload) => {
                    setUpdates(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadUpdates = async () => {
        try {
            setLoadingUpdates(true);
            const { data, error } = await supabase
                .from('software_updates')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUpdates(data || []);
        } catch (err: any) {
            console.error('Erreur de chargement des MAJ:', err);
        } finally {
            setLoadingUpdates(false);
        }
    };

    const handleInstall = async (updateId: string, version: string) => {
        try {
            setInstalling(updateId);
            setError('');
            setSuccess('');
            setUpdateProgress(0);

            // Simulation of installation
            const stages = [
                { limit: 30, text: 'Téléchargement du package...' },
                { limit: 60, text: 'Vérification de l\'intégrité...' },
                { limit: 100, text: 'Installation du micrologiciel...' }
            ];

            const interval = setInterval(() => {
                setUpdateProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    const newProgress = prev + Math.floor(Math.random() * 5) + 2;
                    const stage = stages.find(s => newProgress <= s.limit) || stages[2];
                    setProgressStatus(stage.text);
                    return Math.min(newProgress, 100);
                });
            }, 100);

            // In a real app, we would update the vehicle's version in Supabase here
            setTimeout(() => {
                setSuccess(`Mise à jour ${version} installée avec succès !`);
                setCurrentVersion(version);
                setTimeout(() => {
                    setSuccess('');
                    setInstalling(null);
                    setUpdateProgress(0);
                }, 3000);
            }, 5000);

        } catch (err: any) {
            setError(err.message || 'Erreur d\'installation');
            setInstalling(null);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Réglages</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Personnalisez votre expérience Kemet et gérez votre sécurité.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

                {/* Software Updates Section */}
                <SettingsSection title="Mises à jour logicielles" icon={<Download size={20} color="var(--accent-primary)" />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Current Version Card */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={20} color="#10B981" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Version actuelle : 2.4.12</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dernière vérification : Aujourd'hui à 08:30</div>
                                </div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Stable</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => {
                                    setInstalling('rollback');
                                    let p = 0;
                                    const stages = [
                                        { limit: 40, text: 'Préparation de la restauration...' },
                                        { limit: 80, text: 'Récupération de la version 2.3.8...' },
                                        { limit: 100, text: 'Finalisation du système...' }
                                    ];

                                    const interval = setInterval(() => {
                                        p += Math.floor(Math.random() * 8) + 4;
                                        if (p >= 100) {
                                            p = 100;
                                            setUpdateProgress(100);
                                            setProgressStatus('Terminé');
                                            clearInterval(interval);
                                            setTimeout(() => {
                                                setInstalling(null);
                                                setUpdateProgress(0);
                                                setProgressStatus('');
                                                setSuccess('Restauration de la version 2.3.8 terminée.');
                                                setTimeout(() => setSuccess(''), 3000);
                                            }, 500);
                                        } else {
                                            setUpdateProgress(p);
                                            const stage = stages.find(s => p <= s.limit) || stages[2];
                                            setProgressStatus(stage.text);
                                        }
                                    }, 150);
                                }}
                                disabled={!!installing}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: installing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Clock size={16} /> {installing === 'rollback' ? 'Restauration...' : 'Version précédente'}
                            </button>

                            <button
                                onClick={() => {
                                    setInstalling('update');
                                    let p = 0;
                                    const stages = [
                                        { limit: 30, text: 'Téléchargement du package...' },
                                        { limit: 60, text: 'Vérification de l\'intégrité...' },
                                        { limit: 100, text: 'Installation du micrologiciel...' }
                                    ];

                                    const interval = setInterval(() => {
                                        p += Math.floor(Math.random() * 5) + 2;
                                        if (p >= 100) {
                                            p = 100;
                                            setUpdateProgress(100);
                                            setProgressStatus('Terminé');
                                            clearInterval(interval);
                                            setTimeout(() => {
                                                setInstalling(null);
                                                setUpdateProgress(0);
                                                setProgressStatus('');
                                                setSuccess('Mise à jour 2.5.0 installée avec succès !');
                                                setTimeout(() => setSuccess(''), 3000);
                                            }, 500);
                                        } else {
                                            setUpdateProgress(p);
                                            const stage = stages.find(s => p <= s.limit) || stages[2];
                                            setProgressStatus(stage.text);
                                        }
                                    }, 100);
                                }}
                                disabled={!!installing}
                                style={{
                                    background: 'var(--accent-primary)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: installing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px var(--accent-glow)'
                                }}
                            >
                                <Zap size={16} fill="white" /> {installing === 'update' ? 'Mise à jour...' : 'Lancer la mise à jour'}
                            </button>
                        </div>

                        {/* Progress Bar UI */}
                        {installing && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{progressStatus}</span>
                                    <span style={{ fontWeight: 600 }}>{updateProgress}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${updateProgress}%` }}
                                        style={{ height: '100%', background: installing === 'rollback' ? 'var(--text-secondary)' : 'var(--accent-primary)', boxShadow: installing === 'update' ? '0 0 10px var(--accent-glow)' : 'none' }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}
                    </div>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection title="Notifications" icon={<Bell size={20} color="#FBBF24" />}>
                    <ToggleItem label="Alertes de sécurité" description="Recevoir une alerte si une activité inhabituelle est détectée." defaultChecked />
                    <ToggleItem label="Mises à jour logicielles" description="Être informé quand une nouvelle version est disponible." defaultChecked />
                    <ToggleItem label="Rappels d'entretien" description="Notifications pour les pneus, freins et révisions." />
                </SettingsSection>

                {/* Security Section */}
                <SettingsSection title="Sécurité & Confidentialité" icon={<Shield size={20} color="#10B981" />}>
                    <ToggleItem label="Partage des données de conduite" description="Aider Kemet à améliorer l'autonomie et les performances." />
                    <ToggleItem label="Mode Sentinelle distant" description="Accéder aux caméras de votre Gezo depuis votre téléphone." defaultChecked />
                </SettingsSection>

                {/* App Preferences */}
                <SettingsSection title="Préférences de l'application" icon={<Smartphone size={20} color="#3B82F6" />}>
                    <ToggleItem label="Mode Sombre" description="Utiliser l'interface sombre (recommandé)." defaultChecked />
                    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>Langue</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Choisissez votre langue d'interface.</div>
                        </div>
                        <select style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none'
                        }}>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </SettingsSection>

                {/* Storage & Data */}
                <SettingsSection title="Stockage & Données" icon={<Database size={20} color="#A855F7" />}>
                    <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>Vider le cache</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Libérez de l'espace sur cet appareil.</div>
                        </div>
                        <button style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600
                        }}>
                            Vider
                        </button>
                    </div>
                </SettingsSection>

                {/* Support Section */}
                <SettingsSection title="Assistance & Support" icon={<Headphones size={20} color="var(--accent-primary)" />}>
                    <div style={{ padding: '16px 0' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Besoin d'aide avec votre Gezo ? Accédez à notre centre d'assistance ou discutez avec un expert.
                        </p>
                        <Link href="/support" style={{ textDecoration: 'none' }}>
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                Ouvrir le centre de support
                                <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </SettingsSection>

            </div>
        </div>
    );
}

const SettingsSection = ({ title, icon, children }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ padding: '24px 32px', borderRadius: 'var(--radius-md)' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {icon}
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {children}
        </div>
    </motion.div>
);

const ToggleItem = ({ label, description, defaultChecked }: any) => {
    const [checked, setChecked] = useState(defaultChecked || false);

    return (
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{description}</div>
            </div>
            <div
                onClick={() => setChecked(!checked)}
                style={{
                    width: '44px',
                    height: '24px',
                    background: checked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
            </div>
        </div>
    );
};
