"use client";

import React from 'react';
import { Terminal, ShieldCheck, Activity } from 'lucide-react';

export default function TestingSDAPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Testing SDA</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Outils de diagnostic et tests de conformité Software Defined Architecture</p>
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
                <Terminal size={48} opacity={0.5} />
                <h2 style={{ color: 'white' }}>Section en cours de développement</h2>
                <p style={{ maxWidth: '400px', textAlign: 'center' }}>
                    Cette interface permettra de lancer des cycles de tests automatisés sur les ECUs et de vérifier l'intégrité de la couche SDA.
                </p>
            </div>
        </div>
    );
}
