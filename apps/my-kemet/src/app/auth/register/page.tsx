"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Truck,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.register(email, password, name, brand, model, phone);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel"
                    style={{ maxWidth: '480px', width: '100%', padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                        <CheckCircle2 size={48} color="#10B981" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Bienvenue, {name.split(' ')[0]} !</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
                        Votre compte a été créé avec succès et votre véhicule est maintenant lié à votre profil.
                    </p>
                    <Link href="/" style={{
                        display: 'block',
                        width: '100%',
                        padding: '18px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}>
                        Accéder au tableau de bord
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{ maxWidth: '480px', width: '100%', padding: '48px', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>Créer un compte</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Rejoignez l'univers Kemet SDV.</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} />
                        <span style={{ fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <InputGroup
                        icon={<User size={18} />}
                        label="Nom Complet"
                        placeholder="Ex: Jean Kemet"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <InputGroup
                        icon={<Mail size={18} />}
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={setEmail}
                        required
                    />
                    <InputGroup
                        icon={<Lock size={18} />}
                        label="Mot de passe"
                        type="password"
                        placeholder="Minimum 8 caractères"
                        value={password}
                        onChange={setPassword}
                        required
                    />
                    <InputGroup
                        icon={<User size={18} />}
                        label="Téléphone"
                        type="tel"
                        placeholder="Ex: +221 77 123 45 67"
                        value={phone}
                        onChange={setPhone}
                    />

                    <div style={{ margin: '8px 0', borderTop: '1px solid var(--glass-border)' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Votre Véhicule</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <InputGroup
                            icon={<Truck size={18} />}
                            label="Marque"
                            placeholder="Ex: Gezo"
                            value={brand}
                            onChange={setBrand}
                            required
                        />
                        <InputGroup
                            icon={<Truck size={18} />}
                            label="Modèle"
                            placeholder="Ex: Modèle S"
                            value={model}
                            onChange={setModel}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 4px 20px rgba(31, 111, 92, 0.4)',
                            marginTop: '12px'
                        }}>
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                        {loading ? 'Création en cours...' : 'Activer mon Kemet'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Vous avez déjà un compte ?{' '}
                    <Link href="/auth/login" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                        Connectez-vous
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

const InputGroup = ({ icon, label, type = "text", placeholder, value, onChange, required, help }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {icon}
            </div>
            <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px 14px 48px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
            />
        </div>
        {help && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{help}</span>}
    </div>
);
