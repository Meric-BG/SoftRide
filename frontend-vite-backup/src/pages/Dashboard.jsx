import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, MapPin, Lock, Unlock, Wind } from 'lucide-react';
import gezoSide from '../assets/images/gezo-side.png';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Bonjour, Méric</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Votre Gezo est prête.</p>
                </div>
                <div className="glass-panel status-badge">
                    <div className="status-dot"></div>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Connecté</span>
                </div>
            </header>

            {/* Main Car View */}
            <div className="vehicle-view">
                <motion.img
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    src={gezoSide}
                    alt="Gezo Vehicle"
                    className="vehicle-image"
                />

                {/* Overlay Stats */}
                <div className="glass-panel stats-overlay">
                    <div className="stat-item">
                        <Battery size={32} color="#10B981" />
                        <div>
                            <div className="stat-value">82%</div>
                            <p className="stat-label">Batterie</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>
                    <div className="stat-item">
                        <Zap size={32} color="#FBBF24" />
                        <div>
                            <div className="stat-value">320 km</div>
                            <p className="stat-label">Autonomie</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Controls Grid */}
            <div className="controls-grid">
                <ControlCard icon={<Lock size={24} />} label="Verrouiller" active={true} />
                <ControlCard icon={<Wind size={24} />} label="Climatisation" active={false} />
                <ControlCard icon={<Zap size={24} />} label="Port de charge" active={false} />
                <ControlCard icon={<MapPin size={24} />} label="Localisation" active={true} info="Dakar" />
            </div>
        </div>
    );
};

const ControlCard = ({ icon, label, active, info }) => (
    <motion.button
        whileTap={{ scale: 0.98 }}
        className={`glass-panel control-card ${active ? 'active' : ''}`}
    >
        <div className="control-icon">
            {icon}
        </div>
        <span style={{ fontWeight: 500 }}>{label}</span>
        {info && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{info}</span>}
    </motion.button>
);

export default Dashboard;
