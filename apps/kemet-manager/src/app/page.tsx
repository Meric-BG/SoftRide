"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
// No Recharts for now to keep it simple and ensure no build errors, will use custom CSS bars
// If user really wants recharts I can add it, but CSS bars look cleaner for this specific "dark/minimalist" requirement
// actually I installed recharts, so I can use it if I want, but I'll stick to the CSS implementation I refined earlier, adapted for the new dark theme.

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vue d'ensemble</h1>
          <p className="text-secondary">Métriques clés de performance en temps réel.</p>
        </div>
        <div className="px-4 py-2 bg-accent/20 rounded-md text-sm font-semibold text-accent border border-accent/30">
          Semaine en cours
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <StatCard
          title="Revenu Total"
          value="32.5M FCFA"
          trend="+12.5%"
          isUp={true}
          icon={<DollarSign size={20} className="text-success" />}
        />
        <StatCard
          title="Flotte Active"
          value="1,248"
          trend="+8.2%"
          isUp={true}
          icon={<Activity size={20} className="text-blue-400" />}
        />
        <StatCard
          title="Ventes Store"
          value="4.2M FCFA"
          trend="+24.3%"
          isUp={true}
          icon={<ShoppingBag size={20} className="text-warning" />}
        />
        <StatCard
          title="Abonnements (MRR)"
          value="1.8M FCFA"
          trend="-2.1%"
          isUp={false}
          icon={<Users size={20} className="text-purple-400" />}
        />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* Revenue Chart */}
        <div className="glass-panel p-6 rounded-xl min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Revenus par fonctionnalité</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '32px', paddingBottom: '20px' }}>
            <Bar height="60%" label="Sentinelle" color="var(--success)" />
            <Bar height="85%" label="Boost" color="var(--warning)" />
            <Bar height="40%" label="Premium" color="#3B82F6" />
            <Bar height="30%" label="Data" color="#A855F7" />
          </div>
        </div>

        {/* Top Features List */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Top Ventes</h3>
          <div className="flex flex-col gap-4">
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
    className="glass-panel p-6 rounded-xl relative overflow-hidden"
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-sm font-medium text-secondary">{title}</span>
      <div className="p-2 rounded-lg bg-white/5">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-primary mb-2">{value}</div>
    <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-success' : 'text-error'}`}>
      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {trend}
      <span className="text-secondary font-normal ml-1">vs mois dernier</span>
    </div>
  </motion.div>
);

const Bar = ({ height, label, color }: any) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ width: '48px', background: color, borderRadius: '8px 8px 0 0', opacity: 0.9, boxShadow: `0 0 20px ${color}40` }}
    />
    <span style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

const TopItem = ({ name, count, price }: any) => (
  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
    <div>
      <div className="font-semibold text-sm mb-1">{name}</div>
      <div className="text-xs text-secondary">{count}</div>
    </div>
    <div className="font-mono font-semibold text-success text-sm">{price}</div>
  </div>
);
