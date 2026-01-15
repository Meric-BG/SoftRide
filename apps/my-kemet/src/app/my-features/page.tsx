"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi, Calendar, RefreshCcw, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import styles from './MyFeatures.module.css';

const FEATURE_ICONS: any = {
    'Mode Sentinelle': <Shield size={24} color="#10B981" />,
    'Connectivité Premium': <Wifi size={24} color="#3B82F6" />,
    'Boost Accélération': <Zap size={24} color="#FBBF24" />,
};

export default function MyFeaturesPage() {
    const { user } = useAuth();
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFeatures();
        }
    }, [user]);

    const fetchFeatures = async () => {
        try {
            // Get user's vehicle
            const { data: vehicleData } = await supabase
                .from('vehicles')
                .select('id')
                .eq('owner_id', user?.id)
                .maybeSingle();

            if (!vehicleData) {
                setLoading(false);
                return;
            }

            // Get active features for this vehicle
            const { data: activeFeatures } = await supabase
                .from('active_features')
                .select(`
                    *,
                    features (
                        name,
                        description,
                        category
                    )
                `)
                .eq('vehicle_id', vehicleData.id);

            if (activeFeatures) {
                const formattedFeatures = activeFeatures.map((af: any) => {
                    const isPermanent = af.is_permanent || false;
                    const expiresAt = af.expires_at ? new Date(af.expires_at) : null;
                    const isExpiring = expiresAt && (expiresAt.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000; // 7 days

                    return {
                        id: af.id,
                        icon: FEATURE_ICONS[af.features?.name] || <Zap size={24} color="#10B981" />,
                        title: af.features?.name || 'Fonctionnalité',
                        status: isPermanent ? 'Permanent' : (isExpiring ? 'Expire bientôt' : 'Actif'),
                        statusType: isPermanent ? 'active' : (isExpiring ? 'expiring' : 'active'),
                        expiryDate: isPermanent ? 'N/A' : (expiresAt ? expiresAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'),
                        autoRenew: af.auto_renew || false,
                        isPermanent,
                        description: af.features?.description || 'Fonctionnalité activée'
                    };
                });

                setFeatures(formattedFeatures);
            }
        } catch (error) {
            console.error('Error fetching features:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAutoRenew = async (id: string) => {
        const feature = features.find(f => f.id === id);
        if (!feature) return;

        const newAutoRenew = !feature.autoRenew;

        // Update in database
        const { error } = await supabase
            .from('active_features')
            .update({ auto_renew: newAutoRenew })
            .eq('id', id);

        if (!error) {
            // Update local state
            setFeatures(prev => prev.map(f => {
                if (f.id === id) {
                    return { ...f, autoRenew: newAutoRenew };
                }
                return f;
            }));
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
                <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Chargement...</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Mes Fonctionnalités</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos abonnements actifs et services connectés.</p>
            </header>

            {features.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                    <Info size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        Aucune fonctionnalité active pour le moment. Visitez le Kemet Store pour découvrir nos services.
                    </p>
                </div>
            ) : (
                <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-panel ${styles.featureCard}`}
                        >
                            <div className={styles.cardHeader}>
                                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                    {feature.icon}
                                </div>
                                <span className={`${styles.statusBadge} ${styles[feature.statusType]}`}>
                                    {feature.status}
                                </span>
                            </div>

                            <div className={styles.content}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{feature.title}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {feature.description}
                                </p>
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.expiryInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Calendar size={16} />
                                        <span>{feature.isPermanent ? 'Type :' : 'Expire le :'}</span>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{feature.expiryDate === 'N/A' ? 'Achat Définitif' : feature.expiryDate}</span>
                                </div>

                                {!feature.isPermanent && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <RefreshCcw size={14} color={feature.autoRenew ? "#10B981" : "#505050"} />
                                            <div style={{ fontSize: '12px', fontWeight: 500 }}>Renouvellement</div>
                                        </div>

                                        <div
                                            onClick={() => toggleAutoRenew(feature.id)}
                                            style={{
                                                width: '36px',
                                                height: '20px',
                                                background: feature.autoRenew ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: feature.autoRenew ? '18px' : '2px',
                                                width: '16px',
                                                height: '16px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}></div>
                                        </div>
                                    </div>
                                )}

                                {!feature.autoRenew && !feature.isPermanent && (
                                    <button style={{
                                        marginTop: '16px',
                                        width: '100%',
                                        padding: '10px',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        Renouveler manuellement
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Help Section */}
            <div className="glass-panel" style={{ marginTop: '40px', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'start', gap: '16px' }}>
                <Info size={24} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Gestion des abonnements</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Le renouvellement automatique s'effectue 24h avant l'expiration. Vous pouvez l'activer ou le désactiver à tout moment.
                        Les achats définitifs comme le "Boost Accélération" ne nécessitent pas d'abonnement.
                    </p>
                </div>
            </div>
        </div>
    );
}
