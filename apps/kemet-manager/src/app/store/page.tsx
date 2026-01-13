"use client";

import React from 'react';
import { Plus, Edit, Trash2, TrendingUp, Filter, Download } from 'lucide-react';

export default function StorePage() {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Kemet Store</h1>
                    <p className="text-secondary">Catalogue des fonctionnalités et abonnements.</p>
                </div>
                <button className="primary-button flex items-center gap-2">
                    <Plus size={18} />
                    Ajouter une fonctionnalité
                </button>
            </header>

            {/* Filters & Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-colors">
                        <Filter size={16} />
                        Tous les types
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-colors">
                        Statut: Actif
                    </button>
                </div>
                <button className="text-secondary text-sm flex items-center gap-2 hover:text-white transition-colors">
                    <Download size={16} /> Exporter CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="glass-panel overflow-hidden rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-sm text-secondary uppercase tracking-wider">
                            <th className="p-5 font-semibold">Nom de la Feature</th>
                            <th className="p-5 font-semibold">Type</th>
                            <th className="p-5 font-semibold">Prix</th>
                            <th className="p-5 font-semibold">Revenus (Mensuel)</th>
                            <th className="p-5 font-semibold">Taux d'adoption</th>
                            <th className="p-5 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                        <StoreRow
                            name="Mode Sentinelle"
                            type="Abonnement"
                            price="5 000 FCFA"
                            revenue="445 000 FCFA"
                            trend="+12%"
                            adoption="18%"
                        />
                        <StoreRow
                            name="Boost Accélération"
                            type="Achat Unique"
                            price="1 500 000 FCFA"
                            revenue="213.0M FCFA"
                            trend="+5%"
                            adoption="8%"
                            total={true}
                        />
                        <StoreRow
                            name="Connectivité Premium"
                            type="Abonnement"
                            price="2 500 FCFA"
                            revenue="780 000 FCFA"
                            trend="+8%"
                            adoption="42%"
                        />
                        <StoreRow
                            name="Pack Hiver"
                            type="Achat Unique"
                            price="250 000 FCFA"
                            revenue="12.5M FCFA"
                            trend="-2%"
                            adoption="5%"
                            isDown={true}
                            total={true}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const StoreRow = ({ name, type, price, revenue, trend, total, isDown, adoption }: any) => (
    <tr className="hover:bg-white/5 transition-colors group">
        <td className="p-5 font-semibold text-white">{name}</td>
        <td className="p-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${type === 'Abonnement' ? 'bg-blue-500/20 text-blue-400' : 'bg-warning/20 text-warning'
                }`}>
                {type}
            </span>
        </td>
        <td className="p-5 text-secondary font-mono">{price}</td>
        <td className="p-5">
            <div className="font-bold text-white mb-1">{revenue}</div>
            <div className={`flex items-center gap-1 text-xs ${isDown ? 'text-error' : 'text-success'}`}>
                <TrendingUp size={12} className={isDown ? 'rotate-180' : ''} />
                {trend} {total && <span className="text-secondary font-normal">(Total)</span>}
            </div>
        </td>
        <td className="p-5">
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div style={{ width: adoption }} className="h-full bg-accent"></div>
            </div>
            <span className="text-xs text-secondary mt-1 block">{adoption}</span>
        </td>
        <td className="p-5 text-right">
            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-white/10 rounded-lg text-secondary hover:text-white transition-colors"><Edit size={16} /></button>
                <button className="p-2 hover:bg-error/20 rounded-lg text-secondary hover:text-error transition-colors"><Trash2 size={16} /></button>
            </div>
        </td>
    </tr>
);
