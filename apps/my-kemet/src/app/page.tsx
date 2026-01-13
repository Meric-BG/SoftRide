"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, MapPin, Lock, Unlock, Wind } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [locked, setLocked] = useState(true);
  const [climate, setClimate] = useState(false);
  const [charging, setCharging] = useState(false);

  const toggleLock = () => setLocked(!locked);
  const toggleClimate = () => setClimate(!climate);
  const toggleCharging = () => setCharging(!charging);

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Bonjour, Méric</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Votre Gezo est prête.</p>
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Connecté</span>
        </div>
      </header>

      {/* Main Car View */}
      <div className={styles.vehicleView}>
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          src="/gezo-side.png"
          alt="Gezo Vehicle"
          className={styles.vehicleImage}
        />

        {/* Overlay Stats */}
        <div className={`glass-panel ${styles.statsOverlay}`}>
          <div className={styles.statItem}>
            <Battery size={32} color="#10B981" />
            <div>
              <div className={styles.statValue}>{charging ? 'Charging...' : '82%'}</div>
              <p className={styles.statLabel}>Batterie</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>
          <div className={styles.statItem}>
            <Zap size={32} color={charging ? "#10B981" : "#FBBF24"} />
            <div>
              <div className={styles.statValue}>320 km</div>
              <p className={styles.statLabel}>Autonomie</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Controls Grid */}
      <div className={styles.controlsGrid}>
        <ControlCard
          icon={locked ? <Lock size={24} /> : <Unlock size={24} />}
          label={locked ? "Verrouillé" : "Déverrouillé"}
          active={locked}
          onClick={toggleLock}
        />
        <ControlCard
          icon={<Wind size={24} />}
          label="Climatisation"
          active={climate}
          onClick={toggleClimate}
          info={climate ? "22°C" : "Arrêt"}
        />
        <ControlCard
          icon={<Zap size={24} />}
          label="Port de charge"
          active={charging}
          onClick={toggleCharging}
          info={charging ? "Ouvert" : "Fermé"}
        />
        <ControlCard
          icon={<MapPin size={24} />}
          label="Localisation"
          active={true}
          info="Dakar"
          onClick={() => { }}
        />
      </div>
    </div>
  );
}

const ControlCard = ({ icon, label, active, info, onClick }: any) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`glass-panel ${styles.controlCard} ${active ? styles.active : ''}`}
  >
    <div className={styles.controlIcon}>
      {icon}
    </div>
    <span style={{ fontWeight: 500 }}>{label}</span>
    {info && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{info}</span>}
  </motion.button>
);
