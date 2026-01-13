"use client";

import React from 'react';
import { Truck } from 'lucide-react';

export default function FleetPage() {
    return (
        <div className="max-w-7xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6 animate-pulse">
                <Truck size={64} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Module Flotte en développement</h1>
            <p className="text-secondary max-w-md">La supervision en temps réel et la gestion détaillée de la flotte seront disponibles dans la version 2.6.0 de Kemet Manager.</p>
        </div>
    );
}
