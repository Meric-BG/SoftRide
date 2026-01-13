import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Wifi, AlertTriangle, Shield, Cpu, Activity, Zap, Radio, Cloud, Server } from 'lucide-react';
import io from 'socket.io-client';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';
const DEMO_VIN = 'VIN123';

const socket = io(SOCKET_URL);

const Simulator = () => {
    const { addToast } = useToast();
    const [telemetry, setTelemetry] = useState({
        speed: 0,
        battery_level: 85,
        range_km: 340,
        gear: 'P',
        signal_strength: '4G',
        is_guard_active: true,
        domains: {
            ADAS: { version: '2.0', status: 'IDLE', health: 'OK' },
            COCKPIT: { version: '1.4', status: 'IDLE', health: 'OK' },
            POWERTRAIN: { version: '2.1', status: 'IDLE', health: 'OK' },
            CHASSIS: { version: '1.0', status: 'IDLE', health: 'OK' },
            CONNECTIVITY: { version: '3.0', status: 'IDLE', health: 'OK' }
        }
    });

    const [isConnected, setIsConnected] = useState(false);

    // Socket Connection (For receiving commands from Mobile)
    useEffect(() => {
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Listen for Remote Controls
        socket.on('control_update', (data) => {
            // { action: 'SET_GUARD', value: false }
            if (data.action === 'SET_GUARD') updateLocal('is_guard_active', data.value);
            // Add others as needed
            addToast(`Remote Command Received: ${data.action}`, 'info');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('control_update');
        };
    }, []);

    // Telemetry Sync Loop (Push to Backend)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // We transmit the flat vehicle state derived from our complex state
                const payload = {
                    speed: telemetry.speed,
                    battery_level: telemetry.battery_level,
                    range_km: telemetry.range_km,
                    gear: telemetry.gear,
                    signal_strength: telemetry.signal_strength,
                    is_guard_active: telemetry.is_guard_active
                };

                await fetch(`${API_URL}/vehicles/${DEMO_VIN}/telemetry`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (e) {
                // silent fail on sync
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [telemetry]);

    const updateLocal = (field, value) => {
        setTelemetry(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center k-card p-6">
                <div>
                    <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
                        <Server size={20} className="text-kemet-green" />
                        Digital Twin Monitor
                    </h2>
                    <p className="text-xs text-kemet-subtext uppercase tracking-widest mt-1">VIN: {DEMO_VIN}</p>
                </div>
                <div className={`px-4 py-2 rounded border font-mono text-xs flex items-center gap-2 ${isConnected ? 'bg-kemet-green/10 text-kemet-green border-kemet-green/30' : 'bg-red-900/10 text-red-500 border-red-500/30'}`}>
                    <Wifi size={14} />
                    {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* 1. Physics */}
                <div className="k-card p-6 col-span-1">
                    <h3 className="text-kemet-subtext font-bold mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                        <Activity size={14} /> Physics
                    </h3>
                    <div className="space-y-8">
                        <div className="text-center">
                            <span className="text-6xl font-display font-bold block text-white tabular-nums">{telemetry.speed}</span>
                            <input
                                type="range" min="0" max="200"
                                value={telemetry.speed}
                                onChange={(e) => updateLocal('speed', parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 appearance-none cursor-pointer mt-4"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['P', 'D', 'R'].map(g => (
                                <button key={g} onClick={() => updateLocal('gear', g)} className={`flex-1 py-3 rounded-lg font-bold text-sm ${telemetry.gear === g ? 'bg-kemet-green text-white' : 'bg-white/5 text-kemet-subtext'}`}>{g}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. States */}
                <div className="k-card p-6 col-span-1">
                    <h3 className="text-kemet-subtext font-bold mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                        <Shield size={14} /> Vehicle State
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-xs font-bold text-kemet-subtext uppercase">Guard Mode</span>
                            <button
                                onClick={() => updateLocal('is_guard_active', !telemetry.is_guard_active)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${telemetry.is_guard_active ? 'bg-kemet-green' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${telemetry.is_guard_active ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-xs font-bold text-kemet-subtext uppercase">Current Range</span>
                            <span className="text-sm font-mono font-bold">{telemetry.range_km} km</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;
