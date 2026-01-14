"use client";

import React from 'react';
import { Wrench, ShieldAlert, Clock } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Maintenance</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Planification des entretiens et alertes critiques de la flotte</p>
            </header>

            <div style={{
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed var(--glass-border)',
                borderRadius: '32px',
                color: 'var(--text-secondary)',
                gap: '16px'
            }}>
                <Wrench size={48} opacity={0.5} />
                <h2 style={{ color: 'white' }}>Section en cours de développement</h2>
                <p style={{ maxWidth: '400px', textAlign: 'center' }}>
                    Suivi en temps réel de l'état d'usure des composants mécaniques et gestion proactive des rappels techniques.
                </p>
            </div>
        </div>
    );
}
