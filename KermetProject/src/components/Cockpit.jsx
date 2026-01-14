import React, { useEffect, useState } from 'react';
import { useVehicle } from '../store/vehicleStore';
import { Battery, Zap, Disc, Music, Shield, Settings, MapPin, Power, Play, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import kermetLogo from '../assets/Logo.Kemet.png';

export default function Cockpit({ onClose }) {
    const { vehicleState, setVehicleState, addLog, logs } = useVehicle();
    const { speed, battery, gear } = vehicleState;
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(45);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        addLog(!isPlaying ? 'Ambiance musicale activée. Bonne route !' : 'Musique mise en pause. Mode silence.', 'info');
    };

    const handleVolumeChange = (e) => {
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
    };

    const handleVolumeCommit = () => {
        addLog(`Volume du média ajusté à ${volume}%.`, 'info');
    };

    // Simulate speed changes when in Drive
    useEffect(() => {
        let interval;
        if (gear === 'D') {
            interval = setInterval(() => {
                setVehicleState(prev => {
                    // Simple acceleration logic until 120, then fluctuate
                    let noise = Math.floor(Math.random() * 3) - 1;
                    let target = 86; // Target speed from image
                    if (prev.speed < target) return { ...prev, speed: Math.min(prev.speed + 2, target) };
                    return { ...prev, speed: Math.max(0, prev.speed + noise) };
                });
            }, 100);
        } else {
            // Decelerate if not in gear
            interval = setInterval(() => {
                setVehicleState(prev => ({ ...prev, speed: Math.max(0, prev.speed - 5) }));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gear, setVehicleState]);

    const gears = ['P', 'R', 'N', 'D'];

    return (
        <div className="fixed inset-0 z-50 bg-[#020617] text-slate-100 font-sans overflow-hidden flex flex-col">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${kermetLogo})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '40%',
                    filter: 'grayscale(100%) contrast(120%) opacity(0.5)'
                }}
            />

            {/* Top Status Bar */}
            <div className="w-full h-16 px-8 flex justify-between items-center border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-6">
                    <span className="text-3xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">09:06</span>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Zap size={16} className="text-yellow-400" />
                        <span>32°C</span>
                        <span className="text-slate-600">|</span>
                        <span>Cotonou, Benin</span>
                    </div>
                </div>

                {/* Kermet Logo Area (Center) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4">
                    <div className="h-8 w-8 bg-blue-500 clip-path-hexagon animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center font-bold text-black border border-white">K</div>
                </div>

                <button
                    onClick={() => {
                        addLog("Fermeture du cockpit. À bientôt !", 'info');
                        onClose();
                    }}
                    className="px-4 py-1 rounded bg-slate-900 border border-slate-700 hover:bg-red-900/30 text-xs text-slate-400 transition-colors"
                >
                    EXIT COCKPIT
                </button>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 relative flex">

                {/* Left Panel: Speed & Info */}
                <div className="w-1/3 h-full p-12 flex flex-col justify-center relative">
                    {/* Speedometer Circle */}
                    <div className="relative w-64 h-64 mx-auto">
                        {/* Outer Ring */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="6"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * (Math.min(speed, 200) / 200))}
                                strokeLinecap="round"
                                className="transition-all duration-300 ease-out drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                            />
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                {Math.floor(speed).toString().padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-cyan-500 tracking-[0.2em] mt-2">KM/H</span>
                        </div>
                    </div>

                    {/* Dynamic Vitesse Label */}
                    <div className="absolute top-24 left-0 w-full text-center">
                        <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/60 block mt-1">Vitesse</span>
                    </div>
                </div>

                {/* Center Panel: Car Visualization (Empty space for now per image, or minor details) */}
                <div className="w-1/3 h-full flex flex-col items-center justify-center">
                    {/* Future: 3D Car Model here */}
                </div>

                {/* Right Panel: Media & Status */}
                <div className="w-1/3 h-full p-12 flex flex-col gap-6 justify-center">
                    {/* Battery Widget */}
                    <div className="glass-panel p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs uppercase text-slate-500 font-bold">Energy</span>
                            <Battery size={18} className={battery < 20 ? 'text-red-500' : 'text-emerald-400'} />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-mono font-bold text-slate-200">{battery}%</span>
                            <span className="text-xs text-slate-500 mb-1">340 km est.</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className={`h-full ${battery < 20 ? 'bg-red-500' : 'bg-emerald-400'} shadow-[0_0_10px_currentColor]`}
                                style={{ width: `${battery}%` }}
                            />
                        </div>
                    </div>

                    {/* Media Widget */}
                    <div className="glass-panel p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePlay}
                                className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
                            </button>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Cyberwave FM</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Neon Nights</p>
                            </div>
                            <div className="ml-auto flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-1 h-6 bg-cyan-500/50 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                                        style={{ animationDelay: `${i * 0.1}s`, height: isPlaying ? '24px' : '4px' }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-3 px-1">
                            <Volume2 size={16} className="text-slate-500" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                onMouseUp={handleVolumeCommit}
                                onTouchEnd={handleVolumeCommit}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                            />
                            <span className="text-xs font-mono text-cyan-400 w-8 text-right">{volume}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="w-full h-24 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center gap-12 backdrop-blur-xl relative z-10">

                {/* Gear Selector */}
                <div className="flex gap-4 p-2 bg-black/40 rounded-2xl border border-slate-800">
                    {gears.map(g => (
                        <button
                            key={g}
                            onClick={() => {
                                if (gear !== g) {
                                    setVehicleState(prev => ({ ...prev, gear: g }));
                                    const messages = {
                                        'P': 'Mode Parking activé. Véhicule immobilisé en toute sécurité.',
                                        'D': 'Mode Conduite engagé. Le véhicule va avancer, soyez vigilant.',
                                        'R': 'Marche arrière enclenchée. Vérifiez vos rétroviseurs !',
                                        'N': 'Point mort. Le moteur tourne en roue libre.'
                                    };
                                    addLog(messages[g], 'info');
                                }
                            }}
                            className={`
                            w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300
                            ${gear === g
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110'
                                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/50'}
                        `}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                {/* Auxiliary Controls */}
                <div className="flex gap-4">
                    {[
                        { icon: Shield, label: 'Sécurité', msg: 'Systèmes de protection active engagés.' },
                        { icon: Disc, label: 'Freins', msg: 'Diagnostic freins : Disques et plaquettes OK.' },
                        { icon: MapPin, label: 'Nav', msg: 'Navigation initialisée. En attente de destination.' },
                        { icon: Settings, label: 'Réglages', msg: 'Accès aux paramètres véhicule...' }
                    ].map((Btn, i) => (
                        <button
                            key={i}
                            onClick={() => addLog(Btn.msg, 'info')}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-400/50 transition-all bg-slate-900/50">
                                <Btn.icon size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
