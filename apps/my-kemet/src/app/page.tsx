"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, Zap, Navigation, Lock, Fan, Thermometer, Wind, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Dashboard.module.css';
import LoginView from '@/components/LoginView';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeFeatures, setActiveFeatures] = useState<any[]>([]);
  const [showBoostToast, setShowBoostToast] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchVehicleAndTelemetry = async () => {
      // 1. Get User's Vehicle
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('id, vim, model')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (vehicleData) {
        setVehicle(vehicleData);

        // 2. Get Initial Telemetry
        const { data: telemetryData } = await supabase
          .from('vehicles_telemetry')
          .select('*')
          .eq('vehicle_id', vehicleData.id)
          .maybeSingle();

        if (telemetryData) setTelemetry(telemetryData);

        const fetchActiveFeatures = async () => {
          const { data: featureData } = await supabase
            .from('vehicle_features')
            .select('*, store_features(name)')
            .eq('vehicle_id', vehicleData.id);

          if (featureData) {
            const now = new Date();
            const active = featureData.filter((f: any) => {
              if (!f.expires_at) return true;
              return new Date(f.expires_at) > now;
            });
            setActiveFeatures(active);
          }
        };

        await fetchActiveFeatures();

        // 4. Subscribe to Realtime Data
        const channel = supabase
          .channel(`vehicle-data-${vehicleData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'vehicles_telemetry',
              filter: `vehicle_id=eq.${vehicleData.id}`
            },
            (payload) => setTelemetry(payload.new)
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'vehicle_features',
              filter: `vehicle_id=eq.${vehicleData.id}`
            },
            () => fetchActiveFeatures()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    fetchVehicleAndTelemetry();
  }, [user]);

  // Show login if not authenticated
  if (!loading && !user) {
    return <LoginView />;
  }

  // Show loader while checking auth
  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#1F6F5C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style jsx>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
      </div>
    );
  }

  const isLocked = telemetry?.is_locked ?? true;
  const charge = telemetry?.battery_level ?? 82;
  const isBoostActive = false; // Boost mode is transient/client-side for now in this demo

  const toggleLock = async () => {
    if (!vehicle || !telemetry) return;

    // In a real app, this would call an API endpoint.
    // For this demo, we assume the command succeeds and optimistic update, 
    // BUT we also try to update the DB if RLS allows (or if we are admin/owner).
    const newStatus = !isLocked;

    // Optimistic update
    setTelemetry({ ...telemetry, is_locked: newStatus });

    const { error } = await supabase
      .from('vehicles_telemetry')
      .update({ is_locked: newStatus })
      .eq('vehicle_id', vehicle.id);

    if (error) {
      console.error("Failed to toggle lock:", error);
      // Revert on error
      setTelemetry({ ...telemetry, is_locked: !newStatus });
    }
  };

  const toggleBoost = () => {
    // Boost is client-visual only for now
    setShowBoostToast(true);
    setTimeout(() => setShowBoostToast(false), 3000);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Boost Mode Background Aura */}
      <AnimatePresence>
        {isBoostActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, var(--accent-primary) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        <header className={styles.dashboardHeader}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Ma Gezo</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
              Connecté • Dakar, Sénégal
            </div>
          </div>
          <div className={styles.quickControls}>
            <QuickControl icon={<Lock size={20} />} active={!isLocked} onClick={toggleLock} label={isLocked ? "Verrouillé" : "Déverrouillé"} />
            <QuickControl icon={<Fan size={20} />} label="Clim" />
            <QuickControl
              icon={<Zap size={20} />}
              active={isBoostActive}
              onClick={toggleBoost}
              label="Boost"
              glow={isBoostActive}
            />
          </div>
        </header>

        {/* Compact Metrics Bar */}
        <motion.div
          layout
          className={`glass-panel ${styles.metricsBar}`}
        >
          <div className={styles.infoBox}>
            <div className={styles.statValue}>
              <Battery /> {charge}%
            </div>
            <div className={styles.statLabel}>Charge actuelle</div>
          </div>

          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} className="hide-mobile"></div>

          <div className={styles.infoBox}>
            <div className={styles.statValue}>
              <Navigation /> 342 km
            </div>
            <div className={styles.statLabel}>Autonomie estimée</div>
          </div>
        </motion.div>

        <div className={styles.mainGrid}>
          {/* Energy Chart Column */}
          <div className={styles.analyticsColumn}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Activity size={18} color="var(--accent-primary)" />
                  Consommation Énergie
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dernière heure</span>
              </div>
              <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 10px' }}>
                {[40, 65, 30, 85, 45, 70, 55, 90, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    style={{
                      flex: 1,
                      background: i === 7 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '4px 4px 0 0'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Map Mockup */}
            <div className="glass-panel" style={{
              borderRadius: 'var(--radius-md)',
              background: 'url(https://img.freepik.com/free-vector/dark-map-gps-navigation-interface_52683-37965.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '300px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                background: 'var(--accent-primary)',
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 0 15px var(--accent-glow)'
              }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--glass-bg)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', backdropFilter: 'blur(10px)' }}>
                Localisation en temps réel (GPS Actif)
              </div>
            </div>
          </div>

          {/* Telemetry Stats Column */}
          <div className={styles.telemetryGrid}>
            <StatBox icon={<Thermometer size={18} />} label="Temp. Habitacle" value={`${telemetry?.indoor_temp ?? 22}°C`} />
            <StatBox icon={<Wind size={18} />} label="Pression Pneus" value={`${telemetry?.tire_pressure_bar ?? 2.4} bar`} />
            <StatBox icon={<Battery size={18} />} label="Santé Batterie" value="98%" />
            <QuickStat icon={<Zap size={18} />} label="Mode Boost" value={isBoostActive ? "Activé" : "Désactivé"} active={isBoostActive} />
            <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>Dernier Point</div>
              <div style={{ fontWeight: 'bold' }}>Plage des Almadies, Dakar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Boost Toast */}
      <AnimatePresence>
        {showBoostToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent-primary)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '999px',
              fontWeight: 'bold',
              boxShadow: '0 10px 40px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 1000
            }}
          >
            <Zap size={20} fill="white" />
            BOOST MODE ACTIVÉ
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QuickControl = ({ icon, label, active, onClick, glow }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    <button
      onClick={onClick}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: glow ? '0 0 20px var(--accent-glow)' : 'none'
      }}
    >
      {icon}
    </button>
    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

const StatBox = ({ icon, label, value }: any) => (
  <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
      {icon}
      {label}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const QuickStat = ({ icon, label, value, active }: any) => (
  <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: active ? '4px solid var(--accent-primary)' : 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
      {icon}
      {label}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: active ? 'var(--accent-primary)' : 'white' }}>{value}</div>
  </div>
);
