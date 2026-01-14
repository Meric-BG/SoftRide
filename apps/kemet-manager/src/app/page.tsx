"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Users, ShoppingBag, Activity, TrendingUp,
  TrendingDown, Car, Zap, Calendar, ArrowUpRight, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { COLORS } from '@/constants/colors';
import { MOCK_DATA } from '@/constants/mockData';
import StatCard from '@/components/StatCard';

export default function AdminDashboard() {
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const data = MOCK_DATA[filter];

  return (
    <div className="dashboard-wrapper">
      {/* Header with Filter */}
      <header className="dashboard-header">
        <div>
          <h1>Performance Overview</h1>
          <p>Analyse financière et volume des ventes Kemet</p>
        </div>
        <div className="filter-pills">
          {(['day', 'week', 'month', 'year'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f === 'day' ? 'Jour' : f === 'week' ? 'Sem' : f === 'month' ? 'Mois' : 'An'}
            </button>
          ))}
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        <StatCard
          title="CA Voitures"
          value={data.revenue.cars + " FCFA"}
          subValue={data.counts.cars + " unités sold"}
          icon={<Car size={20} />}
          color="green"
        />
        <StatCard
          title="CA Fonctionnalités"
          value={data.revenue.features + " FCFA"}
          subValue={data.counts.features + " activations"}
          icon={<Zap size={20} />}
          color="amber"
        />
        <StatCard
          title="Ventes Totales"
          value={data.revenue.total + " FCFA"}
          subValue="Revenu consolidé"
          icon={<DollarSign size={20} />}
          color="blue"
        />
        <StatCard
          title="Progression"
          value={data.trends.features}
          subValue="Vs période précédente"
          icon={<TrendingUp size={20} />}
          color="purple"
        />
      </div>

      {/* Main Charts Row */}
      <div className="charts-row">
        {/* Sales Trend Chart */}
        <div className="glass-panel main-chart-panel">
          <div className="chart-header">
            <div className="chart-title">
              <BarChart2 size={18} color="var(--accent-primary)" />
              <h3>Tendances des Ventes</h3>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><i className="dot cars" /> Voitures</span>
              <span className="legend-item"><i className="dot features" /> Fonctions</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFeatures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="cars"
                  stroke="var(--accent-primary)"
                  fillOpacity={1}
                  fill="url(#colorCars)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="features"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorFeatures)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Distribution Pie Chart */}
        <div className="glass-panel distribution-panel">
          <h3 className="panel-title">Top Fonctionnalités</h3>
          <div className="pie-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.topFeatures}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.topFeatures.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-label-overlay">
              <span className="big">Best</span>
              <span className="small">{data.topFeatures[0].name}</span>
            </div>
          </div>
          <div className="custom-legend">
            {data.topFeatures.map((item, index) => (
              <div key={item.name} className="legend-row">
                <span className="l-dot" style={{ backgroundColor: COLORS[index] }} />
                <span className="l-name">{item.name}</span>
                <span className="l-val">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-bottom: 40px;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .dashboard-header h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
        .dashboard-header p { color: var(--text-secondary); }

        .filter-pills {
          background: rgba(255,255,255,0.03);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          display: flex;
          gap: 4px;
        }
        .filter-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.04); }
        .sc-top { display: flex; justify-content: space-between; align-items: center; }
        .sc-icon-box { 
          width: 40px; height: 40px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center;
        }
        .sc-icon-box.green { background: rgba(45, 106, 79, 0.15); color: #52B788; }
        .sc-icon-box.amber { background: rgba(251, 191, 36, 0.15); color: #FBBF24; }
        .sc-icon-box.blue { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
        .sc-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: #C084FC; }
        
        .sc-title { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
        .sc-value { font-size: 24px; font-weight: 800; color: white; margin-top: 4px; }
        .sc-sub { font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }

        /* Charts Row */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .main-chart-panel { padding: 32px; border-radius: 32px; height: 450px; display: flex; flex-direction: column; }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .chart-title { display: flex; align-items: center; gap: 10px; }
        .chart-title h3 { font-size: 18px; font-weight: 700; }
        
        .chart-legend { display: flex; gap: 20px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); font-weight: 600; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.cars { background: var(--accent-primary); }
        .dot.features { background: #3B82F6; }
        
        .chart-container { flex: 1; min-height: 0; }

        .distribution-panel { padding: 32px; border-radius: 32px; display: flex; flex-direction: column; height: 450px; }
        .panel-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; }
        
        .pie-container { position: relative; margin: 0 auto; width: 100%; display: flex; justify-content: center; }
        .pie-label-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .pie-label-overlay .big { font-size: 14px; font-weight: 800; color: var(--accent-primary); text-transform: uppercase; }
        .pie-label-overlay .small { font-size: 11px; font-weight: 600; color: white; width: 80px; text-align: center; line-height: 1.2; margin-top: 2px; }

        .custom-legend { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
        .legend-row { display: flex; align-items: center; gap: 12px; }
        .l-dot { width: 6px; height: 6px; border-radius: 50%; }
        .l-name { flex: 1; font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .l-val { font-size: 12px; font-weight: 700; color: white; }
      `}</style>
    </div>
  );
}

