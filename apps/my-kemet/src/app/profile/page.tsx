"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Shield, Car, Calendar, MapPin, Camera, CreditCard, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Profile.module.css';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            // Strategy 1: Direct ownership
            let { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('owner_id', user?.id)
                .maybeSingle();

            // Strategy 2: Linked via profile (fallback)
            if (!vehicleData) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('vim_linked')
                    .eq('id', user?.id)
                    .single();

                if (profile?.vim_linked) {
                    const { data: linkedVehicle } = await supabase
                        .from('vehicles')
                        .select('*')
                        .eq('vim', profile.vim_linked)
                        .single();
                    vehicleData = linkedVehicle;
                }
            }

            if (vehicleData) {
                setVehicle(vehicleData);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
                <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Chargement...</span>
            </div>
        );
    }

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utilisateur';
    const userEmail = user?.email || '';
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Janvier 2024';

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

                    <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{userName}</h2>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>
                        {vehicle ? `Propriétaire ${vehicle.brand_name}` : 'Membre Kemet'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        <InfoItem icon={<Mail size={16} />} label="Email" value={userEmail} />
                        <InfoItem icon={<MapPin size={16} />} label="Localisation" value="Dakar, Sénégal" />
                        <InfoItem icon={<Calendar size={16} />} label="Membre depuis" value={memberSince} />
                        {vehicle && <InfoItem icon={<Car size={16} />} label="Véhicule lié" value={`${vehicle.brand_name} (VIM: ${vehicle.vim})`} />}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            marginTop: '32px',
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            fontSize: '14px'
                        }}
                    >
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                </motion.div>

                {/* Main Content Areas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Vehicle Details */}
                    {vehicle ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel"
                            style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Car size={20} color="var(--accent-primary)" />
                                Ma {vehicle.brand_name} {vehicle.model_name}
                            </h3>

                            <div className={styles.vehicleGrid}>
                                <DataField label="Modèle" value={`${vehicle.brand_name} ${vehicle.model_name}`} />
                                <DataField label="VIM" value={vehicle.vim || 'N/A'} />
                                <DataField label="Kilométrage" value={`${vehicle.mileage || 0} km`} />
                                <DataField label="Année" value={vehicle.year || 'N/A'} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel"
                            style={{ padding: '32px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}
                        >
                            <Car size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                            <h3>Aucun véhicule associé</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Si vous possédez une Kemet, contactez le support pour lier votre VIM.</p>
                        </motion.div>
                    )}

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
