"use client";

import React from 'react';
import { VehicleProvider, useVehicle } from '@/store/VehicleContext';
import SDVCockpit from '@/components/SDVCockpit';
import { Bell, Terminal, Activity } from 'lucide-react';

const TestingDashboard = () => {
    const { logs } = useVehicle();

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Main Cockpit Area */}
            <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Simulateur SDV</h1>
                    <p className="text-slate-400">Environment de test Kemet Cloud pour mises à jour OTA et diagnostics.</p>
                </header>
                <SDVCockpit />
            </main>

            {/* Logs Sidebar */}
            <aside className="w-80 bg-slate-900/50 border-l border-slate-800 p-4 flex flex-col backdrop-blur-sm">
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Terminal size={14} />
                        Flux de Données
                    </h3>
                    <div className="space-y-2">
                        <div className="bg-black/40 p-3 rounded font-mono text-[10px] text-cyan-400 border border-slate-800">
                            <div>GET /v1/vehicle/telemetry</div>
                            <div className="text-slate-500 mt-1">Status: 200 OK</div>
                            <div className="text-emerald-500 mt-1">Latency: 12ms</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded font-mono text-[10px] text-purple-400 border border-slate-800">
                            <div>WS: wss://api.kemet.cloud/stream</div>
                            <div className="text-slate-500 mt-1">Connected</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Bell size={14} />
                        Journal d'événements
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 font-mono text-[11px] pr-2">
                        {(logs || []).map(log => (
                            <div key={log.id} className="flex gap-2 text-slate-300 items-start">
                                <span className="text-slate-600 whitespace-nowrap">[{log.time}]</span>
                                <div className="flex-1">
                                    <span className={`mr-2 font-bold ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                        {log.type === 'error' ? 'ERR' : log.type === 'success' ? 'OK' : 'INF'}
                                    </span>
                                    <span className={log.type === 'error' ? 'text-red-200' : log.type === 'success' ? 'text-emerald-200' : 'text-slate-300'}>
                                        {log.msg}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <p className="text-slate-600 italic">Aucun événement enregistré</p>}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default function TestingPage() {
    return (
        <VehicleProvider>
            <TestingDashboard />
        </VehicleProvider>
    );
}
