"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi, Calendar, RefreshCcw, Info } from 'lucide-react';
import styles from './MyFeatures.module.css';

const INITIAL_FEATURES = [
    {
        id: 'sentinelle',
        icon: <Shield size={24} color="#10B981" />,
        title: "Mode Sentinelle",
        status: 'Actif',
        statusType: 'active',
        expiryDate: '24 Fév. 2026',
        autoRenew: true,
        description: "Surveillance périmétrique active with enregistrement vidéo."
    },
    {
        id: 'connectivity',
        icon: <Wifi size={24} color="#3B82F6" />,
        title: "Connectivité Premium",
        status: 'Expire bientôt',
        statusType: 'expiring',
        expiryDate: '01 Fév. 2026',
        autoRenew: false,
        description: "Navigation temps réel et streaming multimédia illimité."
    },
    {
        id: 'boost',
        icon: <Zap size={24} color="#FBBF24" />,
        title: "Boost Accélération",
        status: 'Permanent',
        statusType: 'active',
        expiryDate: 'N/A',
        autoRenew: false,
        isPermanent: true,
        description: "Performances moteur accrues (Mise à jour logicielle)."
    }
];

export default function MyFeaturesPage() {
    const [features, setFeatures] = useState(INITIAL_FEATURES);

    const toggleAutoRenew = (id: string) => {
        setFeatures(prev => prev.map(f => {
            if (f.id === id) {
                return { ...f, autoRenew: !f.autoRenew };
            }
            return f;
        }));
    };

    return (
        <div className={styles.container}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Mes Fonctionnalités</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos abonnements actifs et services connectés.</p>
            </header>

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
