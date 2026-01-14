"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, X, CheckCircle, AlertTriangle } from 'lucide-react';

const NOTIFICATIONS = [
    { id: 1, title: 'Charge terminée', msg: 'Votre batterie est chargée à 100%.', type: 'success' },
    { id: 2, title: 'Sécurité', msg: 'Mouvement détecté près du véhicule.', type: 'warning' },
    { id: 3, title: 'Mise à jour', msg: 'Une nouvelle version logicielle est disponible.', type: 'info' },
];

export default function NotificationToast() {
    const [activeNotification, setActiveNotification] = useState<any>(null);

    useEffect(() => {
        // Randomly show notifications every 45-60 seconds for simulation
        const showRandom = () => {
            const random = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
            setActiveNotification(random);
            setTimeout(() => setActiveNotification(null), 5000);
        };

        const timer = setTimeout(showRandom, 10000); // First one after 10s
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {activeNotification && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
                        zIndex: 2000,
                        width: '320px',
                    }}
                >
                    <div className="glass-panel" style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        gap: '16px',
                        borderLeft: `4px solid ${activeNotification.type === 'success' ? '#10B981' : activeNotification.type === 'warning' ? '#FBBF24' : '#3B82F6'}`
                    }}>
                        <div style={{ marginTop: '2px' }}>
                            {activeNotification.type === 'success' && <CheckCircle size={20} color="#10B981" />}
                            {activeNotification.type === 'warning' && <AlertTriangle size={20} color="#FBBF24" />}
                            {activeNotification.type === 'info' && <Info size={20} color="#3B82F6" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'white' }}>{activeNotification.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{activeNotification.msg}</div>
                        </div>
                        <button
                            onClick={() => setActiveNotification(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', alignSelf: 'flex-start', padding: '0' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
