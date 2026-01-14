"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi, Layers, Star } from 'lucide-react';
import styles from './Store.module.css';
import SubscriptionModal from '@/components/SubscriptionModal';

interface Feature {
    feature_id: string;
    name: string;
    description: string;
    base_price: number;
    pricing_model: string;
    currency: string;
    image_url?: string;
}

export default function Store() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            console.log('Fetching features from backend...');
            const res = await fetch('http://localhost:5001/api/store/features');
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            console.log('Features received:', data);

            if (Array.isArray(data)) {
                setFeatures(data);
            }
        } catch (err) {
            console.error('Error fetching features:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (feature: Feature) => {
        setSelectedPlan({
            id: feature.feature_id,
            name: feature.name,
            price: feature.base_price,
            interval: feature.pricing_model === 'SUBSCRIPTION' ? 'mois' : 'à vie',
            oneTime: feature.pricing_model !== 'SUBSCRIPTION'
        });
    };

    const getIcon = (name: string) => {
        if (!name) return <Layers size={32} color="#9CA3AF" />;
        const lower = name.toLowerCase();
        if (lower.includes('sentinelle') || lower.includes('shield') || lower.includes('sécurité')) return <Shield size={32} color="#10B981" />;
        if (lower.includes('boost') || lower.includes('accélération') || lower.includes('zap')) return <Zap size={32} color="#FBBF24" />;
        if (lower.includes('wifi') || lower.includes('connectivité') || lower.includes('premium')) return <Wifi size={32} color="#3B82F6" />;
        if (lower.includes('pilot') || lower.includes('conduite')) return <Star size={32} color="#8B5CF6" />;
        return <Layers size={32} color="#9CA3AF" />;
    };

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
                {loading ? (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px' }}>Chargement des offres...</div>
                ) : features.length === 0 ? (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px' }}>Aucune offre disponible pour le moment.</div>
                ) : (
                    features.map((f) => (
                        <StoreCard
                            key={f.feature_id}
                            icon={f.image_url ? (
                                <img src={f.image_url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : getIcon(f.name)}
                            title={f.name}
                            description={f.description}
                            price={`${(f.base_price || 0).toLocaleString()} ${f.currency || 'FCFA'}${f.pricing_model === 'SUBSCRIPTION' ? ' / mois' : ''}`}
                            oneTime={f.pricing_model !== 'SUBSCRIPTION'}
                            onAction={() => handleSubscribe(f)}
                            hasImage={!!f.image_url}
                        />
                    ))
                )}
            </div>

            {selectedPlan && (
                <SubscriptionModal
                    isOpen={!!selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    plan={selectedPlan}
                />
            )}
        </div>
    );
}

const StoreCard = ({ icon, title, description, price, oneTime, onAction, hasImage }: any) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-panel ${styles.storeCard}`}
        >
            <div className={hasImage ? styles.cardImageWrapper : styles.cardIconWrapper}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>{description}</p>
            </div>
            <div className={styles.cardFooter}>
                <span style={{ fontWeight: 'bold' }}>{price}</span>
                <button
                    className={styles.secondaryButton}
                    style={{
                        width: '100%',
                        marginTop: '12px',
                    }}
                    onClick={onAction}
                >
                    {oneTime ? 'Acheter' : "S'abonner"}
                </button>
            </div>
        </motion.div>
    );
}
