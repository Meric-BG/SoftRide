"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi } from 'lucide-react';
import styles from './Store.module.css';

export default function Store() {
    //   const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'one-time'
    // Leaving unused state commented out or remove it to fix lint

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Kemet Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Améliorez votre expérience de conduite.</p>
                </div>
            </header>

            {/* Hero / Featured */}
            <div className={`glass-panel ${styles.featuredBanner}`}>
                <div style={{ maxWidth: '60%' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Essai de Mode Sentinelle</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Surveillez votre véhicule à 360° quand vous êtes stationné. 30 jours gratuits.</p>
                    <button className={styles.primaryButton} onClick={() => alert('Essai activé !')}>Activer l'essai</button>
                </div>
            </div>

            {/* Categories / Grid */}
            <div className={styles.storeGrid}>
                <StoreCard
                    icon={<Shield size={32} color="#10B981" />}
                    title="Mode Sentinelle"
                    description="Caméras et capteurs actifs pour une sécurité maximale."
                    price="5 000 FCFA / mois"
                />
                <StoreCard
                    icon={<Zap size={32} color="#FBBF24" />}
                    title="Boost Accélération"
                    description="Réduisez le 0-100 km/h de 0.5s."
                    price="1 500 000 FCFA"
                    oneTime={true}
                />
                <StoreCard
                    icon={<Wifi size={32} color="#3B82F6" />}
                    title="Connectivité Premium"
                    description="Streaming musique, cartes satellite, et navigation live."
                    price="2 500 FCFA / mois"
                />
            </div>
        </div>
    );
}

const StoreCard = ({ icon, title, description, price, oneTime }: any) => {
    const [purchased, setPurchased] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-panel ${styles.storeCard}`}
        >
            <div className={styles.cardIconWrapper}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>{description}</p>
            </div>
            <div className={styles.cardFooter}>
                <span style={{ fontWeight: 'bold' }}>{purchased ? 'Acheté' : price}</span>
                <button
                    className={styles.secondaryButton}
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        background: purchased ? 'rgba(16, 185, 129, 0.2)' : undefined,
                        color: purchased ? '#10B981' : undefined
                    }}
                    onClick={() => setPurchased(true)}
                    disabled={purchased}
                >
                    {purchased ? 'Activé' : (oneTime ? 'Acheter' : "S'abonner")}
                </button>
            </div>
        </motion.div>
    );
}
