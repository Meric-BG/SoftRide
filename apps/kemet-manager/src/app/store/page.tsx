"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Filter, Download, X, Smartphone, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feature {
    feature_id: string;
    name: string;
    description: string;
    base_price: number;
    pricing_model: string;
    currency: string;
    image_url?: string;
}

export default function StorePage() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            console.log('Fetching features...');
            const res = await fetch('http://localhost:5001/api/store/features');
            const data = await res.json();
            console.log('Features fetched:', data);
            setFeatures(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching features:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFeatureAdded = () => {
        console.log('Feature successfully added, refreshing...');
        fetchFeatures();
        setIsModalOpen(false);
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Kemet Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Catalogue des fonctionnalités et abonnements.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px'
                    }}>
                    <Plus size={18} />
                    Ajouter une fonctionnalité
                </button>
            </header>

            {/* Filters & Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                        <Filter size={16} />
                        Tous les types
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                        Statut: Actif
                    </button>
                </div>
                <button style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Download size={16} /> Exporter CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom de la Feature</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prix</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenus (Mensuel)</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux d'adoption</th>
                            <th style={{ padding: '20px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
                        ) : features.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Aucune fonctionnalité trouvée.</td></tr>
                        ) : (
                            features.map((f) => (
                                <StoreRow
                                    key={f.feature_id}
                                    name={f.name}
                                    type={f.pricing_model === 'SUBSCRIPTION' ? 'Abonnement' : 'Achat Unique'}
                                    price={`${f.base_price?.toLocaleString() || 0} ${f.currency || 'FCFA'}`}
                                    revenue="0 FCFA"
                                    trend="0%"
                                    adoption="0%"
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddFeatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleFeatureAdded}
            />
        </div>
    );
}

const StoreRow = ({ name, type, price, revenue, trend, total, isDown, adoption }: any) => (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="store-row">
        <td style={{ padding: '20px', fontWeight: 600 }}>{name}</td>
        <td style={{ padding: '20px' }}>
            <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: type === 'Abonnement' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                color: type === 'Abonnement' ? '#3B82F6' : '#FBBF24'
            }}>
                {type}
            </span>
        </td>
        <td style={{ padding: '20px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{price}</td>
        <td style={{ padding: '20px' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{revenue}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: isDown ? '#EF4444' : '#10B981' }}>
                <TrendingUp size={12} style={{ transform: isDown ? 'rotate(180deg)' : 'none' }} />
                {trend} {total && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Total)</span>}
            </div>
        </td>
        <td style={{ padding: '20px' }}>
            <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: adoption, height: '100%', background: 'var(--accent-primary)' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>{adoption}</span>
        </td>
        <td style={{ padding: '20px', textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} className="row-actions">
                <button style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit size={16} /></button>
                <button style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
        </td>
    </tr>
);

const AddFeatureModal = ({ isOpen, onClose, onSuccess }: any) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [pricingModel, setPricingModel] = useState('SUBSCRIPTION');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log('Submitting feature:', { name, price });

        try {
            const token = localStorage.getItem('token');
            console.log('Sending request to http://localhost:5001/api/store/features ...');
            const res = await fetch('http://localhost:5001/api/store/features', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price) || 0,
                    pricing_model: pricingModel,
                    image_url: imageUrl
                })
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response body:', data);

            if (res.ok) {
                console.log('Feature added successfully!');
                onSuccess();
            } else {
                setError(data.error || 'Une erreur est survenue lors de l\'ajout.');
            }
        } catch (err) {
            console.error('Error adding feature:', err);
            setError('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '40px', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Nouvelle Fonctionnalité</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Définissez une nouvelle offre pour le catalogue Kemet.</p>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontSize: '14px', fontWeight: 500 }}>Nom de la fonctionnalité</label>
                            <input
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: Park Assist Pro"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', color: 'white', outline: 'none', transition: 'border-color 0.2s' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontSize: '14px', fontWeight: 500 }}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Détaillez les bénéfices pour l'utilisateur..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', color: 'white', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontSize: '14px', fontWeight: 500 }}>Prix (FCFA)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', color: 'white', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontSize: '14px', fontWeight: 500 }}>Facturation</label>
                                <select
                                    value={pricingModel}
                                    onChange={(e) => setPricingModel(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', color: 'white', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="SUBSCRIPTION">Abonnement</option>
                                    <option value="LIFETIME">Achat Unique</option>
                                    <option value="FREE">Gratuit</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontSize: '14px', fontWeight: 500 }}>URL de l'image (Optionnel)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px 14px 48px', color: 'white', outline: 'none' }}
                                />
                                <ImageIcon size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '16px',
                                transition: 'transform 0.1s active'
                            }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                            {loading ? 'Enregistrement...' : 'Publier la fonctionnalité'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
