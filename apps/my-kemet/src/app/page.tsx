"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, MapPin, Lock, Unlock, Wind, Loader2 } from 'lucide-react';
import styles from './Dashboard.module.css';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [climate, setClimate] = useState(false);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
        if (userData.vehicles && userData.vehicles.length > 0) {
          const firstVehicle = userData.vehicles[0];
          setVehicle(firstVehicle);
          setLocked(firstVehicle.is_locked);
          setClimate(firstVehicle.climate_state);
          setCharging(firstVehicle.is_charging);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleLock = async () => {
    if (!vehicle) return;
    try {
      const newLocked = !locked;
      await api.toggleLock(vehicle.vin, newLocked);
      setLocked(newLocked);
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  const toggleClimate = async () => {
    if (!vehicle) return;
    try {
      const newClimate = !climate;
      await api.toggleClimate(vehicle.vin, newClimate);
      setClimate(newClimate);
    } catch (err) {
      console.error('Failed to toggle climate:', err);
    }
  };

  const toggleCharging = async () => {
    if (!vehicle) return;
    try {
      const newCharging = !charging;
      await api.toggleCharge(vehicle.vin, newCharging);
      setCharging(newCharging);
    } catch (err) {
      console.error('Failed to toggle charging:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
        <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Chargement de votre univers...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Bonjour, {user?.name || 'Utilisateur'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Votre {vehicle?.brand_name || 'Kemet'} {vehicle?.model_name || ''} est prête.</p>
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
          src="/gezo-hero.png"
          alt="Vehicle"
          className={styles.vehicleImage}
        />

        {/* Overlay Stats */}
        <div className={`glass-panel ${styles.statsOverlay}`}>
          <div className={styles.statItem}>
            <Battery size={32} color="#10B981" />
            <div>
              <div className={styles.statValue}>{charging ? 'En charge...' : `${vehicle?.battery_level || 0}%`}</div>
              <p className={styles.statLabel}>Batterie</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>
          <div className={styles.statItem}>
            <Zap size={32} color={charging ? "#10B981" : "#FBBF24"} />
            <div>
              <div className={styles.statValue}>{vehicle?.range_km || 0} km</div>
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
          info={vehicle?.location_name || "Dakar"}
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
