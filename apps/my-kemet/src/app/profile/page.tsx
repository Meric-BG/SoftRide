"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Shield, Car, Calendar, MapPin, Camera, CreditCard } from 'lucide-react';
import styles from './Profile.module.css';

export default function ProfilePage() {
    return (
        <div className={styles.container}>
            <header style={{ marginBottom: '40px' }} className={styles.profileHeader}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Mon Profil</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations personnelles et préférences.</p>
            </header>

            <div className={styles.profileGrid}>

                {/* Profile Side Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel"
                    style={{ padding: '32px', borderRadius: 'var(--radius-md)', height: 'fit-content', textAlign: 'center' }}
                >
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <User size={64} color="var(--accent-primary)" />
                        </div>
                        <button style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            <Camera size={16} />
                        </button>
                    </div>

                    <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Méric Studant</h2>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>Propriétaire Gezo</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        <InfoItem icon={<Mail size={16} />} label="Email" value="meric@kemet.io" />
                        <InfoItem icon={<MapPin size={16} />} label="Localisation" value="Dakar, Sénégal" />
                        <InfoItem icon={<Calendar size={16} />} label="Membre depuis" value="Janvier 2024" />
                    </div>
                </motion.div>

                {/* Main Content Areas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Vehicle Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel"
                        style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={20} color="var(--accent-primary)" />
                            Ma Kemet Gezo
                        </h3>

                        <div className={styles.vehicleGrid}>
                            <DataField label="Modèle" value="Gezo Performance 2024" />
                            <DataField label="VIN" value="KM7-GEZO-8829-XSL" />
                            <DataField label="Kilométrage" value="12,450 km" />
                            <DataField label="Dernière révision" value="15 Déc. 2024" />
                        </div>
                    </motion.div>

                    {/* Security & Access */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel"
                        style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={20} color="var(--accent-primary)" />
                            Sécurité du compte
                        </h3>

                        <button style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginBottom: '16px',
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <div style={{ fontWeight: 500 }}>Changer le mot de passe</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Améliorez la sécurité de votre compte</div>
                        </button>

                        <button style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <div style={{ fontWeight: 500 }}>Authentification à deux facteurs</div>
                            <div style={{ fontSize: '12px', color: '#10B981' }}>Activé</div>
                        </button>
                    </motion.div>

                    {/* Billing Shortcut */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel"
                        style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} color="var(--accent-primary)" />
                            Paiement et Facturation
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Gérez vos cartes bancaires, consultez vos factures et suivez vos paiements fractionnés.
                        </p>
                        <Link href="/billing" style={{ textDecoration: 'none' }}>
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textAlign: 'center'
                            }}>
                                Voir les détails de facturation
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{value}</div>
        </div>
    </div>
);

const DataField = ({ label, value }: any) => (
    <div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>{value}</div>
    </div>
);
