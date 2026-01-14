"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { adminApi } from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getOverview();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Erreur lors de la récupération des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  if (error) return <div style={{ padding: '40px', color: '#EF4444' }}>{error}</div>;

  const formatPrice = (p: number) => {
    if (p >= 1000000) return (p / 1000000).toFixed(1) + 'M';
    if (p >= 1000) return (p / 1000).toFixed(1) + 'k';
    return p.toString();
  };
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
          value={`${formatPrice(stats?.revenue.total || 0)} FCFA`}
          trend={`+${stats?.revenue.growth}%`}
          isUp={true}
          icon={<DollarSign size={24} style={{ color: 'var(--accent-primary)' }} />}
        />
        <StatCard
          title="Flotte Active"
          value={stats?.fleet.total.toString() || "0"}
          trend={`+${stats?.fleet.growth}%`}
          isUp={true}
          icon={<Activity size={24} style={{ color: '#3B82F6' }} />}
        />
        <StatCard
          title="Ventes Store"
          value={stats?.sales.total.toString() || "0"}
          trend={`+${stats?.sales.growth}%`}
          isUp={true}
          icon={<ShoppingBag size={24} style={{ color: '#FBBF24' }} />}
        />
        <StatCard
          title="Abonnements (MRR)"
          value={`${formatPrice(stats?.revenue.mrr || 0)} FCFA`}
          trend={`-2.1%`}
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
            {stats?.revenue.byFeature?.slice(0, 4).map((f: any, i: number) => (
              <Bar
                key={f.feature_id}
                height={`${Math.min(100, (f.total_revenue / (stats.revenue.total || 1)) * 200)}%`}
                label={f.name.split(' ')[0]}
                color={i % 2 === 0 ? 'var(--accent-primary)' : '#FBBF24'}
              />
            )) || <p>Pas de données</p>}
          </div>
        </div>

        {/* Top Features List */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Top Ventes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats?.revenue.byFeature?.slice(0, 4).map((f: any) => (
              <TopItem
                key={f.feature_id}
                name={f.name}
                count={`${f.active_subscriptions} actifs`}
                price={formatPrice(f.price_amount)}
              />
            )) || <p>Pas de données</p>}
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
