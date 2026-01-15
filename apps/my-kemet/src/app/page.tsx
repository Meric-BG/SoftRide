"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, MapPin, Lock, Unlock, Wind, Loader2 } from 'lucide-react';
import styles from './Dashboard.module.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import LoginView from '@/components/LoginView';
import AssistantView from '@/components/AssistantView';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [climate, setClimate] = useState(false);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch user's vehicle
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (vehicleData) {
          setVehicle(vehicleData);

          // Fetch telemetry
          const { data: telemetryData } = await supabase
            .from('vehicles_telemetry')
            .select('*')
            .eq('vehicle_id', vehicleData.id)
            .maybeSingle();

          if (telemetryData) {
            setLocked(telemetryData.is_locked ?? true);
            setClimate(telemetryData.climate_state ?? false);
            setCharging(telemetryData.is_charging ?? false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const toggleLock = async () => {
    if (!vehicle) return;
    try {
      const newLocked = !locked;
      await supabase
        .from('vehicles_telemetry')
        .update({ is_locked: newLocked })
        .eq('vehicle_id', vehicle.id);
      setLocked(newLocked);
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  const toggleClimate = async () => {
    if (!vehicle) return;
    try {
      const newClimate = !climate;
      await supabase
        .from('vehicles_telemetry')
        .update({ climate_state: newClimate })
        .eq('vehicle_id', vehicle.id);
      setClimate(newClimate);
    } catch (err) {
      console.error('Failed to toggle climate:', err);
    }
  };

  const toggleCharging = async () => {
    if (!vehicle) return;
    try {
      const newCharging = !charging;
      await supabase
        .from('vehicles_telemetry')
        .update({ is_charging: newCharging })
        .eq('vehicle_id', vehicle.id);
      setCharging(newCharging);
    } catch (err) {
      console.error('Failed to toggle charging:', err);
    }
  };

  // Show login if not authenticated
  if (!authLoading && !user) {
    return <LoginView />;
  }

  if (loading || authLoading) {
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
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Bonjour, {user?.user_metadata?.name || 'Utilisateur'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Votre {vehicle?.brand_name || 'Kemet'} {vehicle?.model_name || ''} est prête.</p>
          {vehicle?.vim && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>VIM:</span>
              <code style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'rgba(31, 111, 92, 0.1)',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                {vehicle.vim}
              </code>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Compact Stats */}
          <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Battery size={18} color="#10B981" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{charging ? 'En charge...' : `${vehicle?.battery_level || 0}%`}</span>
          </div>
          <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color={charging ? "#10B981" : "#FBBF24"} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{vehicle?.range_km || 0} km</span>
          </div>
          <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Connecté</span>
          </div>
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

      {/* Assistant Kemet Floating Button */}
      <AssistantView />
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
    <span style={{ fontWeight: 600, fontSize: '15px', color: 'white' }}>{label}</span>
    {info && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{info}</span>}
  </motion.button>
);
