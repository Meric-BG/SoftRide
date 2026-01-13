import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Download } from 'lucide-react';
import './Updates.css';

const Updates = () => {
    const [checking, setChecking] = useState(false);
    const [upToDate, setUpToDate] = useState(true);

    const handleCheck = () => {
        setChecking(true);
        setTimeout(() => {
            setChecking(false);
            // Randomly simulate an update available? For now, stay up to date
            setUpToDate(true);
        }, 2000);
    };

    return (
        <div className="updates-container">
            <header className="updates-header">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Logiciel</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Mises à jour et notes de version.</p>
                </div>
            </header>

            {/* Current Version Card */}
            <div className="glass-panel version-card">
                <div className="flex-row gap-4 align-center">
                    <div className="version-icon-box">
                        <CheckCircle size={32} color="#10B981" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Version actuelle</p>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>KemetOS 2.4.1</h2>
                    </div>
                </div>

                <button
                    className="secondary-button flex-row align-center gap-2"
                    onClick={handleCheck}
                    disabled={checking}
                >
                    <RefreshCw size={18} className={checking ? 'spin' : ''} />
                    {checking ? 'Recherche...' : 'Rechercher des mises à jour'}
                </button>
            </div>

            {/* Release Notes */}
            <div className="release-notes-section">
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Notes de version v2.4.1</h3>

                <div className="glass-panel note-card">
                    <h4>Améliorations de l'autonomie</h4>
                    <p>Optimisation de la gestion thermique de la batterie pour augmenter l'autonomie de 5% par temps chaud.</p>
                </div>

                <div className="glass-panel note-card">
                    <h4>Nouveau design du tableau de bord</h4>
                    <p>Interface rafraîchie avec une meilleure visualisation du véhicule et des contrôles plus accessibles.</p>
                </div>

                <div className="glass-panel note-card">
                    <h4>Corrections de bugs</h4>
                    <p>Résolution d'un problème d'affichage de la pression des pneus sur l'application mobile.</p>
                </div>
            </div>
        </div>
    );
};

export default Updates;
