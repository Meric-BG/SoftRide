"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation,
    Zap,
    X,
    Activity,
    Info,
    CloudDownload,
    Truck,
    Search,
    RefreshCw,
    MapPin,
    Battery
} from 'lucide-react';

interface Vehicle {
    vehicle_id: string;
    vin: string;
    model_name: string;
    battery_level: number;
    location_name: string;
    status: string;
    notifications: any[];
    map_coords?: { x: number; y: number };
}

export default function FleetMap() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFleet();
        const interval = setInterval(fetchFleet, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchFleet = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/vehicles');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setVehicles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching fleet:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', perspective: '1500px' }}>
            {/* Header / Search HUD */}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>KEMET COMMAND CENTER</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }}></div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '2px' }}>FLEET SCANNING: ONLINE</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Search size={16} color="var(--accent-primary)" />
                        <input
                            placeholder="RECHERCHE VIN / MODELE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '12px', outline: 'none', width: '200px', fontWeight: 'bold' }}
                        />
                    </div>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="glass-panel" style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(5, 10, 8, 0.95)',
                margin: '0 24px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: 'inset 0 0 100px rgba(16, 185, 129, 0.05)'
            }}>
                {/* 3D Environment */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    perspective: '1000px'
                }}>
                    {/* Animated Floor Grid */}
                    <div style={{
                        position: 'absolute',
                        width: '200%',
                        height: '200%',
                        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        transform: 'rotateX(70deg) translateY(-200px)',
                        transformOrigin: 'center center',
                        maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
                        pointerEvents: 'none'
                    }}></div>

                    {/* Vehicle Markers Container */}
                    <div style={{
                        position: 'relative',
                        width: '1000px',
                        height: '600px',
                        transform: 'rotateX(70deg) translateY(-100px)',
                        transformStyle: 'preserve-3d'
                    }}>
                        {loading ? (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotateX(-70deg)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <RefreshCw className="animate-spin" size={24} /> INITIALISATION DU SCAN FLOTTE...
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotateX(-70deg)', color: 'var(--text-muted)' }}>
                                AUCUN VEHICULE TROUVE DANS LE SECTEUR.
                            </div>
                        ) : filteredVehicles.map((vehicle) => (
                            <VehicleMarker3D
                                key={vehicle.vehicle_id}
                                vehicle={vehicle}
                                onClick={() => setSelectedVehicle(vehicle)}
                                active={selectedVehicle?.vehicle_id === vehicle.vehicle_id}
                            />
                        ))}
                    </div>
                </div>

                {/* Info Overlay (Floating Card) */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            style={{
                                position: 'absolute',
                                right: '24px',
                                top: '24px',
                                bottom: '24px',
                                width: '380px',
                                zIndex: 100,
                                background: 'rgba(10, 15, 12, 0.95)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold', letterSpacing: '2px' }}>DATA_STREAM // {selectedVehicle.vehicle_id}</div>
                                <button onClick={() => setSelectedVehicle(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{selectedVehicle.model_name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <MapPin size={14} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedVehicle.location_name}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>BATTERIE</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Battery size={20} color={selectedVehicle.battery_level > 20 ? '#10B981' : '#EF4444'} />
                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedVehicle.battery_level}%</span>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>SIGNAL</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Activity size={20} color="#3B82F6" />
                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>LTE-P</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>LOGS DE NOTIFICATIONS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(selectedVehicle.notifications || []).length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                            AUCUNE NOTIFICATION ACTIVE
                                        </div>
                                    ) : (
                                        (selectedVehicle.notifications || []).map((notif: any) => (
                                            <div key={notif.id} style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '8px' }}>
                                                    <Info size={14} />
                                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>ALERTE {notif.type}</span>
                                                </div>
                                                <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{notif.title}</div>
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>{notif.message}</p>
                                                <button style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'var(--accent-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <CloudDownload size={16} /> DEPLOYER LA MISE À JOUR
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedVehicle(null)}
                                style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                FERMER LA SESSION
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const VehicleMarker3D = ({ vehicle, onClick, active }: any) => {
    const coords = vehicle.map_coords || { x: 500, y: 300 };
    const hasUpdates = (vehicle.notifications || []).length > 0;

    return (
        <motion.div
            initial={false}
            animate={{
                x: coords.x,
                y: coords.y,
                scale: active ? 1.5 : 1
            }}
            onClick={onClick}
            style={{
                position: 'absolute',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                zIndex: active ? 50 : 10
            }}
        >
            {/* Holographic Ground Circle */}
            <motion.div
                animate={active ? { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                    position: 'absolute',
                    top: '15px',
                    left: '-20px',
                    width: '80px',
                    height: '40px',
                    background: active ? 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    transform: 'translateZ(-1px)',
                    filter: 'blur(5px)'
                }}
            />

            {/* Float Element */}
            <motion.div
                animate={{
                    y: hasUpdates ? [-10, -25, -10] : [-5, -15, -5],
                    rotateX: -70 // Correct for the parent container's 70deg tilt
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* 3D Car Bubble */}
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(10, 10, 10, 0.8)',
                    backdropFilter: 'blur(5px)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px solid ${active ? 'var(--accent-primary)' : hasUpdates ? '#F59E0B' : 'rgba(16, 185, 129, 0.3)'}`,
                    boxShadow: hasUpdates ? '0 0 20px rgba(245, 158, 11, 0.5)' : active ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                    position: 'relative'
                }}>
                    <Truck size={24} color={vehicle.status === 'Offline' ? '#EF4444' : active ? 'white' : '#10B981'} />

                    {/* Pulsing Notification Dot */}
                    {hasUpdates && (
                        <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '14px',
                                height: '14px',
                                background: '#EF4444',
                                borderRadius: '50%',
                                border: '2px solid #000',
                                boxShadow: '0 0 10px #EF4444'
                            }}
                        />
                    )}
                </div>

                {/* Vertical Pin Line */}
                <div style={{ width: '2px', height: '24px', background: `linear-gradient(to top, transparent, ${active ? 'var(--accent-primary)' : 'rgba(16, 185, 129, 0.4)'})` }}></div>

                {/* Cyber Label */}
                <div style={{
                    marginTop: '2px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    background: active ? 'var(--accent-primary)' : 'rgba(0,0,0,0.85)',
                    color: 'white',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: active ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
                }}>
                    {vehicle.model_name}
                </div>
            </motion.div>
        </motion.div>
    );
}
