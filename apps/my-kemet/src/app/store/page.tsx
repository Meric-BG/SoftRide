"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi, CreditCard } from 'lucide-react';
import styles from './Store.module.css';

export default function Store() {
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
                    price={5000}
                    featureId="FEAT_SENTINEL"
                    pricingModel="SUBSCRIPTION"
                />
                <StoreCard
                    icon={<Zap size={32} color="#FBBF24" />}
                    title="Boost Accélération"
                    description="Réduisez le 0-100 km/h de 0.5s."
                    price={1500000}
                    featureId="FEAT_PERF_BOOST"
                    pricingModel="ONE_TIME"
                />
                <StoreCard
                    icon={<Wifi size={32} color="#3B82F6" />}
                    title="Connectivité Premium"
                    description="Streaming musique, cartes satellite, et navigation live."
                    price={2500}
                    featureId="FEAT_STREAMING"
                    pricingModel="SUBSCRIPTION"
                />
            </div>
        </div>
    );
}

interface StoreCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    price: number;
    featureId: string;
    pricingModel: 'SUBSCRIPTION' | 'ONE_TIME';
}

const StoreCard = ({ icon, title, description, price, featureId, pricingModel }: StoreCardProps) => {
    const [showPayment, setShowPayment] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handlePurchase = async () => {
        if (!phoneNumber) {
            setMessage('Veuillez entrer votre numéro');
            setStatus('error');
            return;
        }

        setLoading(true);
        setStatus('pending');
        setMessage('Envoi de la demande de paiement...');

        const userId = localStorage.getItem('userId') || 'USR001';
        const vehicleId = localStorage.getItem('vehicleId') || 'VH001';

        try {
            // Call FedaPay Checkout
            const res = await fetch('http://localhost:5000/api/payments/fedapay/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    featureId: featureId,
                    vehicleId: vehicleId,
                    paymentData: {
                        phoneNumber: phoneNumber
                    },
                    userId: userId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors du paiement');
            }

            if (data.paymentUrl) {
                setMessage('Redirection vers FedaPay...');
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('URL de paiement manquante');
            }

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(err.message || 'Une erreur est survenue');
            setLoading(false);
        }
    };

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

            {!showPayment ? (
                <div className={styles.cardFooter}>
                    <span style={{ fontWeight: 'bold' }}>
                        {price.toLocaleString()} FCFA {pricingModel === 'SUBSCRIPTION' && '/ mois'}
                    </span>
                    <button
                        className={styles.secondaryButton}
                        style={{ width: '100%', marginTop: '12px' }}
                        onClick={() => setShowPayment(true)}
                    >
                        <CreditCard size={16} style={{ marginRight: '8px' }} />
                        {pricingModel === 'ONE_TIME' ? 'Acheter' : "S'abonner"}
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '16px', width: '100%' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Numéro MTN MoMo
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+229 XX XX XX XX"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: '#050505',
                                border: '1px solid rgba(31, 111, 92, 0.2)',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    {message && (
                        <div
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                marginBottom: '12px',
                                background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                    status === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                        'rgba(59, 130, 246, 0.1)',
                                color: status === 'success' ? '#10B981' :
                                    status === 'error' ? '#EF4444' :
                                        '#3B82F6',
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => {
                                setShowPayment(false);
                                setStatus('idle');
                                setMessage('');
                                setPhoneNumber('');
                            }}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1,
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handlePurchase}
                            disabled={loading || !phoneNumber}
                            style={{
                                flex: 2,
                                padding: '10px',
                                background: loading || !phoneNumber ? '#555' : '#1F6F5C',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: loading || !phoneNumber ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                            }}
                        >
                            {loading ? 'En cours...' : `Payer ${price.toLocaleString()} FCFA`}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
