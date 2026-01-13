"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Vue d'ensemble</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Métriques clés de performance en temps réel.</p>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard
          title="Revenu Total"
          value="32.5M FCFA"
          trend="+12.5%"
          isUp={true}
          icon={<DollarSign size={24} style={{ color: 'var(--accent-primary)' }} />}
        />
        <StatCard
          title="Flotte Active"
          value="1,248"
          trend="+8.2%"
          isUp={true}
          icon={<Activity size={24} style={{ color: '#3B82F6' }} />}
        />
        <StatCard
          title="Ventes Store"
          value="4.2M FCFA"
          trend="+24.3%"
          isUp={true}
          icon={<ShoppingBag size={24} style={{ color: '#FBBF24' }} />}
        />
        <StatCard
          title="Abonnements (MRR)"
          value="1.8M FCFA"
          trend="-2.1%"
          isUp={false}
          icon={<Users size={24} style={{ color: '#A855F7' }} />}
        />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* Revenue Chart */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '32px' }}>Revenus par fonctionnalité</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '32px', paddingBottom: '20px' }}>
            <Bar height="60%" label="Sentinelle" color="var(--accent-primary)" />
            <Bar height="85%" label="Boost" color="#FBBF24" />
            <Bar height="40%" label="Premium" color="#3B82F6" />
            <Bar height="30%" label="Data" color="#A855F7" />
          </div>
        </div>

        {/* Top Features List */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Top Ventes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TopItem name="Boost Accélération" count="142 ventes" price="1.5M" />
            <TopItem name="Mode Sentinelle" count="89 abonnés" price="5k/mois" />
            <TopItem name="Connectivité" count="312 abonnés" price="2.5k/mois" />
            <TopItem name="Pack Hiver" count="12 ventes" price="250k" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Components

const StatCard = ({ title, value, trend, isUp, icon }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-panel"
    style={{ padding: '24px', borderRadius: 'var(--radius-md)', position: 'relative' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isUp ? '#10B981' : '#EF4444' }}>
      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {trend}
      <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '4px' }}>vs mois dernier</span>
    </div>
  </motion.div>
);

const Bar = ({ height, label, color }: any) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        width: '100%',
        maxWidth: '60px',
        background: color,
        borderRadius: '8px 8px 0 0',
        opacity: 0.9
      }}
    />
    <span style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

const TopItem = ({ name, count, price }: any) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.2s'
  }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
  >
    <div>
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{count}</div>
    </div>
    <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-primary)' }}>{price}</div>
  </div>
);
