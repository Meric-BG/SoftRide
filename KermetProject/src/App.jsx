import React, { useState } from 'react';
import {
  Cpu,
  Navigation,
  Activity,
  Zap,
  RefreshCw,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVehicle, DOMAINS } from './store/vehicleStore';

function DomainNode({ domain, status, onClick, isSelected }) {
  const Icon = domain.icon;
  return (
    <motion.div
      layoutId={domain.id}
      onClick={() => onClick(domain)}
      whileHover={{ scale: 1.05 }}
      className={`relative cursor-pointer glass-panel p-6 flex flex-col items-center justify-center transition-all ${isSelected ? 'border-blue-400 ring-2 ring-blue-400/20' : ''}`}
    >
      <div className={`p-4 rounded-full bg-slate-900/50 mb-3 ${domain.color} shadow-lg ${domain.glow}`}>
        <Icon size={32} />
      </div>
      <h3 className="font-semibold text-slate-100">{domain.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <div className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-blue-400 duration-500'}`} />
        <span className="text-xs text-slate-400 uppercase tracking-widest">{status}</span>
      </div>
    </motion.div>
  );
}

const VehicleLayout = ({ activeDomainId }) => (
  <div className="relative w-full h-64 bg-slate-900/40 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden mb-8">
    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
      <svg viewBox="0 0 800 300" className="w-[80%] h-full p-8 fill-blue-500">
        <path d="M100,150 Q100,50 200,50 L600,50 Q750,50 750,150 L750,200 Q750,250 650,250 L150,250 Q100,250 100,150 Z" />
        <circle cx="200" cy="250" r="40" className="fill-slate-700" />
        <circle cx="600" cy="250" r="40" className="fill-slate-700" />
      </svg>
    </div>

    <div className="relative z-10 w-full max-w-2xl px-12 grid grid-cols-3 gap-y-16 gap-x-24 place-items-center">
      {DOMAINS.map((d) => (
        <motion.div
          key={d.id}
          animate={{
            scale: activeDomainId === d.id ? 1.5 : 1,
            opacity: activeDomainId ? (activeDomainId === d.id ? 1 : 0.3) : 1
          }}
          className={`h-3 w-3 rounded-full transition-shadow duration-500 ${activeDomainId === d.id ? 'bg-blue-400 shadow-[0_0_20px_rgba(56,189,248,1)]' : 'bg-slate-700'}`}
        />
      ))}
    </div>
    <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] uppercase tracking-tighter text-slate-500 font-bold">
      <Navigation size={12} /> Zonal Controller Topology Map
    </div>
  </div>
);

export default function App() {
  const [selectedDomain, setSelectedDomain] = useState(null);

  const {
    statuses,
    firmwares,
    vehicleState,
    setVehicleState,
    isCampaignRunning,
    simulateFailure,
    setSimulateFailure,
    logs,
    startCampaign,
    handleUpdate,
    ecuFirmwares,
    ecuHealth
  } = useVehicle();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans selection:bg-blue-500/30">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 glow-text mb-2">
            SDV Architecture Simulator
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Zap size={16} className="text-blue-400" />
            Centralized Zonal Controller Model v4.0.12
          </p>
        </div>
        <div className="glass-panel px-6 py-3 flex items-center gap-6 divide-x divide-slate-800">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-400" size={20} />
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Bus Load</p>
              <p className="text-lg font-mono leading-none">12.4 Gb/s</p>
            </div>
          </div>
          <div className="pl-6 flex items-center gap-3">
            <RefreshCw className="text-emerald-400 animate-spin-slow" size={20} />
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Cloud Sync</p>
              <p className="text-lg font-mono leading-none">Stable</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VehicleLayout activeDomainId={selectedDomain?.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {DOMAINS.map(domain => (
              <DomainNode
                key={domain.id}
                domain={domain}
                status={statuses[domain.id]}
                isSelected={selectedDomain?.id === domain.id}
                onClick={setSelectedDomain}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel p-6 border-cyan-500/30 bg-cyan-500/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
              <RefreshCw size={14} />
              FOTA Control Center
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Battery</p>
                <p className={`text-lg font-mono ${vehicleState.battery < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {vehicleState.battery}%
                </p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Gear Status</p>
                <p className={`text-lg font-mono ${vehicleState.gear === 'P' ? 'text-blue-400' : 'text-amber-400'}`}>
                  {vehicleState.gear === 'P' ? 'Parked' : 'Driving'}
                </p>
              </div>
            </div>

            <button
              onClick={startCampaign}
              disabled={isCampaignRunning}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {isCampaignRunning ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Campaign in Progress...
                </>
              ) : (
                <>
                  <Activity size={18} />
                  Start Full Vehicle Update
                </>
              )}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setVehicleState(prev => ({ ...prev, gear: prev.gear === 'P' ? 'D' : 'P' }))}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-400 border border-slate-700 transition-colors"
              >
                Gear: {vehicleState.gear === 'P' ? 'Park' : 'Drive'}
              </button>
              <button
                onClick={() => setVehicleState(prev => ({ ...prev, battery: prev.battery > 20 ? 15 : 85 }))}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-400 border border-slate-700 transition-colors"
              >
                Bat: {vehicleState.battery}%
              </button>
              <button
                onClick={() => setVehicleState(prev => ({ ...prev, connected: !prev.connected }))}
                className={`text-[10px] px-3 py-1 rounded-lg border transition-colors ${vehicleState.connected ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-red-900/40 text-red-400 border-red-800'}`}
              >
                Network: {vehicleState.connected ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setSimulateFailure(!simulateFailure)}
                className={`text-[10px] px-3 py-1 rounded-lg border transition-colors ${!simulateFailure ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-orange-900/40 text-orange-400 border-orange-800'}`}
              >
                Fail Mode: {simulateFailure ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedDomain ? (
              <motion.div
                key={selectedDomain.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 border-blue-400/30 bg-blue-400/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedDomain.name}</h2>
                    <p className="text-slate-400 text-sm">Hardware ID: ECU_ZONE_{selectedDomain.id.toUpperCase()}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-slate-800/50 ${selectedDomain.color}`}>
                    <selectedDomain.icon size={24} />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Firmware</span>
                    <span className="font-mono text-blue-400">{firmwares[selectedDomain.id]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Health Status</span>
                    <span className="text-emerald-400">98.2% Optimal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Power Draw</span>
                    <span className="text-amber-400">1.2kW (Peak)</span>
                  </div>
                </div>

                {/* Sub-ECU List */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">Internal Domain Units</h4>
                  <div className="space-y-3">
                    {selectedDomain.ecus.map(ecu => (
                      <div key={ecu.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-slate-200 font-bold">{ecu.name}</p>
                            <p className="text-[10px] text-slate-500">{ecu.supplier} • {ecu.hw}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ecuHealth[ecu.id].dtc === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {ecuHealth[ecu.id].dtc}
                          </span>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="w-2/3">
                            <div className="flex justify-between text-[9px] text-slate-500 mb-1 uppercase font-bold">
                              <span>Memory Usage</span>
                              <span>{ecuHealth[ecu.id].memory}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${ecuHealth[ecu.id].memory}%` }}
                                className={`h-full ${ecuHealth[ecu.id].memory > 85 ? 'bg-red-500' : 'bg-blue-500'}`}
                              />
                            </div>
                          </div>
                          <p className="text-xs font-mono text-cyan-400/70">{ecuFirmwares[ecu.id]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUpdate(selectedDomain.id)}
                  disabled={statuses[selectedDomain.id] === 'updating' || isCampaignRunning}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 transition-colors font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                >
                  {statuses[selectedDomain.id] === 'updating' ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Updating Firmware...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Push OTA Update
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="glass-panel p-12 text-center text-slate-500 border-dashed border-2">
                <Cpu size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a domain controller to view system diagnostics and push updates</p>
              </div>
            )}
          </AnimatePresence>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Bell size={14} />
              System Event Log
            </h3>
            <div className="space-y-3 font-mono text-[11px] max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 text-slate-300">
                  <span className="text-slate-600">[{log.time}]</span>
                  <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-400/80'}`}>$</span>
                  <span className={log.type === 'error' ? 'text-red-200' : log.type === 'success' ? 'text-emerald-200' : ''}>{log.msg}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-600 italic">No events recorded</p>}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

