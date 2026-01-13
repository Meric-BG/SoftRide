"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

export default function UpdatesPage() {
    const [deploying, setDeploying] = useState(false);

    const handleDeploy = (e: React.FormEvent) => {
        e.preventDefault();
        setDeploying(true);
        setTimeout(() => {
            setDeploying(false);
            alert('Mise à jour v2.5.0 déployée avec succès vers 850 véhicules !');
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Gestion des Mises à jour</h1>
                <p className="text-secondary">Publiez des mises à jour FOTA (Firmware Over-The-Air) pour la flotte.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Release Builder - Left Column */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <UploadCloud size={20} className="text-accent" />
                        Nouvelle Version
                    </h3>

                    <form onSubmit={handleDeploy} className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Version du Build" placeholder="ex: 2.5.0.124" />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-secondary">Priorité</label>
                                <select className="bg-bg-tertiary border border-glass-border rounded-lg p-3 text-white outline-none focus:border-accent">
                                    <option>Normale</option>
                                    <option>Critique (Sécurité)</option>
                                    <option>Hotfix</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-secondary">Notes de version (Public)</label>
                            <textarea
                                rows={6}
                                placeholder="- Amélioration de la gestion batterie..."
                                className="bg-bg-tertiary border border-glass-border rounded-lg p-3 text-white w-full outline-none focus:border-accent"
                            ></textarea>
                        </div>

                        {/* Target Audience */}
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                            <label className="text-sm font-bold text-secondary mb-3 block">Cible de déploiement</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="target" defaultChecked className="accent-accent w-4 h-4" />
                                    <span>Toute la flotte</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="target" className="accent-accent w-4 h-4" />
                                    <span>Beta Testeurs (Internal)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={deploying}
                                className="primary-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deploying ? 'Déploiement en cours...' : 'Publier la mise à jour'}
                                {!deploying && <UploadCloud size={18} />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Fragmentation & History */}
                <div className="flex flex-col gap-8">

                    {/* Version Distribution Chart */}
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-semibold mb-6">Fragmentation OS</h3>
                        <div className="relative h-48 flex items-center justify-center flex-col">
                            {/* Minimalist Bar Visualization */}
                            <div className="w-full flex h-6 rounded-full overflow-hidden mb-8">
                                <div style={{ width: '65%' }} className="bg-success h-full" />
                                <div style={{ width: '25%' }} className="bg-warning h-full" />
                                <div style={{ width: '10%' }} className="bg-blue-500 h-full" />
                            </div>

                            <div className="w-full space-y-3">
                                <LegendItem color="bg-success" label="v2.4.1 (Stable)" value="65%" />
                                <LegendItem color="bg-warning" label="v2.4.0" value="25%" />
                                <LegendItem color="bg-blue-500" label="v2.3.x (Legacy)" value="10%" />
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="glass-panel p-6 rounded-xl flex-1">
                        <h3 className="text-lg font-semibold mb-6">Historique</h3>
                        <div className="space-y-4">
                            <HistoryItem version="v2.4.1" date="12 Jan 2025" status="success" />
                            <HistoryItem version="v2.4.0" date="20 Dec 2024" status="success" />
                            <HistoryItem version="v2.3.5" date="15 Nov 2024" status="warning" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

const InputGroup = ({ label, placeholder }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-secondary">{label}</label>
        <input
            type="text"
            placeholder={placeholder}
            className="bg-bg-tertiary border border-glass-border rounded-lg p-3 text-white outline-none focus:border-accent w-full"
        />
    </div>
);

const LegendItem = ({ color, label, value }: any) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-secondary">{label}</span>
        </div>
        <span className="font-semibold font-mono">{value}</span>
    </div>
);

const HistoryItem = ({ version, date, status }: any) => (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
        <div className="flex gap-3 items-center">
            <div className={`p-2 rounded-md ${status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                <Clock size={16} />
            </div>
            <div>
                <div className="font-semibold text-sm">{version}</div>
                <div className="text-xs text-secondary">{date}</div>
            </div>
        </div>
        <div>
            {status === 'success' ? <CheckCircle size={18} className="text-success" /> : <AlertCircle size={18} className="text-warning" />}
        </div>
    </div>
);
