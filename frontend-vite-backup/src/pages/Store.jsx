import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Wifi } from 'lucide-react';
import './Store.css';

const Store = () => {
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'one-time'

    return (
        <div className="store-container">
            <header className="store-header">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Kemet Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Améliorez votre expérience de conduite.</p>
                </div>
            </header>

            {/* Hero / Featured */}
            <div className="glass-panel featured-banner">
                <div style={{ maxWidth: '60%' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Essaie de Mode Sentinelle</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Surveillez votre véhicule à 360° quand vous êtes stationné. 30 jours gratuits.</p>
                    <button className="primary-button">Activer l'essai</button>
                </div>
            </div>

            {/* Categories / Grid */}
            <div className="store-grid">
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
};

const StoreCard = ({ icon, title, description, price, oneTime }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel store-card"
    >
        <div className="card-icon-wrapper">
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>{description}</p>
        </div>
        <div className="card-footer">
            <span style={{ fontWeight: 'bold' }}>{price}</span>
            <button className="secondary-button" style={{ width: '100%', marginTop: '12px' }}>
                {oneTime ? 'Acheter' : "S'abonner"}
            </button>
        </div>
    </motion.div>
);

export default Store;
