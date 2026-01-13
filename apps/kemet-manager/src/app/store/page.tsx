"use client";

import React from 'react';
import { Plus, Edit, Trash2, TrendingUp, Filter, Download } from 'lucide-react';

export default function StorePage() {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Kemet Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Catalogue des fonctionnalités et abonnements.</p>
                </div>
                <button style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                }}>
                    <Plus size={18} />
                    Ajouter une fonctionnalité
                </button>
            </header>

            {/* Filters & Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                        <Filter size={16} />
                        Tous les types
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                        Statut: Actif
                    </button>
                </div>
                <button style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Download size={16} /> Exporter CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom de la Feature</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prix</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenus (Mensuel)</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux d'adoption</th>
                            <th style={{ padding: '20px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                        <StoreRow
                            name="Mode Sentinelle"
                            type="Abonnement"
                            price="5 000 FCFA"
                            revenue="445 000 FCFA"
                            trend="+12%"
                            adoption="18%"
                        />
                        <StoreRow
                            name="Boost Accélération"
                            type="Achat Unique"
                            price="1 500 000 FCFA"
                            revenue="213.0M FCFA"
                            trend="+5%"
                            adoption="8%"
                            total={true}
                        />
                        <StoreRow
                            name="Connectivité Premium"
                            type="Abonnement"
                            price="2 500 FCFA"
                            revenue="780 000 FCFA"
                            trend="+8%"
                            adoption="42%"
                        />
                        <StoreRow
                            name="Pack Hiver"
                            type="Achat Unique"
                            price="250 000 FCFA"
                            revenue="12.5M FCFA"
                            trend="-2%"
                            adoption="5%"
                            isDown={true}
                            total={true}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const StoreRow = ({ name, type, price, revenue, trend, total, isDown, adoption }: any) => (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="store-row">
        <td style={{ padding: '20px', fontWeight: 600 }}>{name}</td>
        <td style={{ padding: '20px' }}>
            <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: type === 'Abonnement' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                color: type === 'Abonnement' ? '#3B82F6' : '#FBBF24'
            }}>
                {type}
            </span>
        </td>
        <td style={{ padding: '20px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{price}</td>
        <td style={{ padding: '20px' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{revenue}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: isDown ? '#EF4444' : '#10B981' }}>
                <TrendingUp size={12} style={{ transform: isDown ? 'rotate(180deg)' : 'none' }} />
                {trend} {total && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Total)</span>}
            </div>
        </td>
        <td style={{ padding: '20px' }}>
            <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: adoption, height: '100%', background: 'var(--accent-primary)' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>{adoption}</span>
        </td>
        <td style={{ padding: '20px', textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', opacity: 0 }} className="row-actions">
                <button style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit size={16} /></button>
                <button style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
        </td>
    </tr>
);
