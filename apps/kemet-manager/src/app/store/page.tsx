"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, TrendingUp, Filter, Download,
    Search, X, Upload, Check, Info, DollarSign, Calendar, Zap, Users, BarChart3,
    Layers, Settings, Sparkles, Image as ImageIcon, CreditCard, Code
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

interface Feature {
    id: string;
    name: string;
    description: string;
    price_xof: number;
    price_annual_xof: number;
    image_url: string;
    is_active: boolean;
    allow_installments: boolean; // New field
    category: string;
    created_at?: string;
}

export default function StorePage() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState<Partial<Feature>>({
        is_active: true,
        allow_installments: false,
        category: 'Performance',
        price_xof: 0,
        price_annual_xof: 0
    });

    const fetchFeatures = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('store_features')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setFeatures(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFeatures();

        const channel = supabase
            .channel('store-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'store_features' },
                () => {
                    fetchFeatures();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredFeatures = useMemo(() => {
        return features.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [features, searchTerm]);

    const handleAddEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFeature) {
                const { error } = await supabase
                    .from('store_features')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        price_xof: formData.price_xof,
                        price_annual_xof: formData.price_annual_xof,
                        image_url: formData.image_url,
                        is_active: formData.is_active,
                        allow_installments: formData.allow_installments,
                        category: formData.category
                    })
                    .eq('id', editingFeature.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('store_features')
                    .insert([formData]);
                if (error) throw error;
            }
            closeModal();
            fetchFeatures();
        } catch (err) {
            console.error('Error saving feature:', err);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Supprimer définitivement cette fonctionnalité ?')) {
            try {
                const { error } = await supabase
                    .from('store_features')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                fetchFeatures();
            } catch (err) {
                console.error('Error deleting feature:', err);
            }
        }
    };

    const openModal = (feature?: Feature) => {
        if (feature) {
            setEditingFeature(feature);
            setFormData(feature);
        } else {
            setEditingFeature(null);
            setFormData({ is_active: true, category: 'Performance', price_xof: 0, price_annual_xof: 0 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFeature(null);
        setFormData({ is_active: true, category: 'Performance', price_xof: 0, price_annual_xof: 0 });
    };

    return (
        <div className="store-container">
            <header className="store-header">
                <div>
                    <h1>Kemet Store</h1>
                    <p>Catalogue des options logicielles et services connectés</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px var(--accent-glow)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="add-btn"
                >
                    <Plus size={18} />
                    Ajouter une fonctionnalité
                </motion.button>
            </header>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && <X size={16} className="clear-icon" onClick={() => setSearchTerm('')} />}
                </div>
                <div className="view-stats">
                    <Layers size={14} />
                    <span>{features.length} Fonctions actives</span>
                </div>
            </div>

            <div className="features-grid">
                <AnimatePresence mode="popLayout">
                    {filteredFeatures.map((f) => (
                        <motion.div
                            layout
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="feature-card glass-panel"
                        >
                            <div className="card-image">
                                {f.image_url ? (
                                    <img src={f.image_url} alt={f.name} />
                                ) : (
                                    <div className={`image-placeholder ${f.category === 'Performance' ? 'amber' : 'blue'}`}>
                                        <Sparkles size={32} />
                                    </div>
                                )}
                                <div className={`card-type-tag ${f.category === 'Performance' ? 'amber' : 'blue'}`}>{f.category}</div>
                            </div>

                            <div className="card-content">
                                <div className="card-top">
                                    <div>
                                        <h3 className="feature-title">{f.name}</h3>
                                        <span className="feature-tech-code">{f.id.split('-')[0]}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="row-action-btn edit" onClick={() => openModal(f)}><Edit size={16} /></button>
                                        <button className="row-action-btn delete" onClick={(e) => handleDelete(f.id, e)}><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <p className="feature-description">{f.description}</p>

                                <div className="card-metrics-grid">
                                    <div className="metric-box">
                                        <Users size={12} className="m-icon users" />
                                        <span className="m-val">--</span>
                                        <span className="m-label">Clients</span>
                                    </div>
                                    <div className="metric-box">
                                        <CreditCard size={12} className="m-icon revenue" />
                                        <span className="m-val">--</span>
                                        <span className="m-label">Revenus</span>
                                    </div>
                                    <div className="metric-box">
                                        <TrendingUp size={12} className="m-icon adoption" />
                                        <span className="m-val">--</span>
                                        <span className="m-label">Usage</span>
                                    </div>
                                </div>

                                <div className="card-bottom-info">
                                    <div className="price-container">
                                        <span className="p-currency">FCFA</span>
                                        <span className="p-amount">{f.price_xof?.toLocaleString()}</span>
                                        {f.price_annual_xof > 0 && <span className="p-period">/m</span>}
                                    </div>
                                    <div className={`status-pill ${f.is_active ? 'on' : 'off'}`}>
                                        <span className="s-dot" /> {f.is_active ? 'Actif' : 'Inactif'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredFeatures.length === 0 && !isLoading && (
                <div className="empty-state">
                    <Search size={40} className="empty-icon" />
                    <p>Aucune fonctionnalité trouvée.</p>
                </div>
            )}

            {/* STUNNING MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="premium-modal-overlay" onClick={closeModal}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="premium-modal-content custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-glow-accent" />

                            <button className="premium-close-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>

                            <div className="premium-modal-header">
                                <div className="header-icon-container">
                                    {editingFeature ? <Settings className="icon-pulse" /> : <Plus className="icon-pulse" />}
                                </div>
                                <div className="header-text">
                                    <h2>{editingFeature ? 'Éditer la Fonctionnalité' : 'Nouvelle Fonctionnalité'}</h2>
                                    <p>{editingFeature ? `ID : ${editingFeature.id}` : 'Configurez les paramètres globaux de votre nouveau service store.'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddEdit} className="premium-form">
                                <div className="form-layout-grid">
                                    {/* General Info Section */}
                                    <div className="form-column">
                                        <div className="input-section-title">
                                            <ImageIcon size={14} /> INFORMATIONS GÉNÉRALES
                                        </div>

                                        <div className="premium-input-field">
                                            <label>URL de l'image (Optionnel)</label>
                                            <div className="input-with-icon">
                                                <ImageIcon size={16} className="field-icon" />
                                                <input
                                                    type="text"
                                                    value={formData.image_url || ''}
                                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                                    placeholder="Lien vers l'image"
                                                />
                                            </div>
                                        </div>

                                        <div className="premium-input-field">
                                            <label>Nom du service</label>
                                            <div className="input-with-icon">
                                                <Sparkles size={16} className="field-icon" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name || ''}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="ex: Mode Sentinelle Pro"
                                                />
                                            </div>
                                        </div>

                                        <div className="premium-input-field">
                                            <label>Catégorie</label>
                                            <div className="select-wrapper">
                                                <select
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="Performance">Performance</option>
                                                    <option value="Connectivité">Connectivité</option>
                                                    <option value="Sécurité">Sécurité</option>
                                                    <option value="Divertissement">Divertissement</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="premium-input-field">
                                            <label>Description commerciale</label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Quels sont les avantages ?"
                                            />
                                        </div>
                                    </div>

                                    {/* Pricing & Logic Section */}
                                    <div className="form-column dark-section">
                                        <div className="input-section-title">
                                            <CreditCard size={14} /> TARIFICATION & STATUT
                                        </div>

                                        <div className="tier-pricing-grid">
                                            <div className="premium-input-field">
                                                <label>Prix Mensuel (FCFA)</label>
                                                <div className="input-with-icon">
                                                    <span className="field-symbol">M</span>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.price_xof || 0}
                                                        onChange={e => setFormData({ ...formData, price_xof: parseInt(e.target.value) })}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="premium-input-field">
                                                <label>Prix Annuel (FCFA)</label>
                                                <div className="input-with-icon">
                                                    <span className="field-symbol">A</span>
                                                    <input
                                                        type="number"
                                                        value={formData.price_annual_xof || 0}
                                                        onChange={e => setFormData({ ...formData, price_annual_xof: parseInt(e.target.value) })}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-input-field">
                                            <label>Disponibilité Store</label>
                                            <div className="select-wrapper">
                                                <select
                                                    value={formData.is_active ? 'Actif' : 'Inactif'}
                                                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'Actif' })}
                                                >
                                                    <option value="Actif">Publié (Visible par tous les véhicules)</option>
                                                    <option value="Inactif">Brouillon (Masqué)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="premium-input-field">
                                            <label>Options de paiement</label>
                                            <div className={`premium-toggle-simple ${formData.allow_installments ? 'on' : 'off'}`}
                                                onClick={() => setFormData({ ...formData, allow_installments: !formData.allow_installments })}>
                                                <div className="toggle-thumb" />
                                                <span>Paiement fractionné autorisé</span>
                                            </div>
                                        </div>

                                        <div className="info-alert">
                                            <Check size={14} style={{ flexShrink: 0 }} />
                                            <p>Une fois publié, ce service sera immédiatement visible par l'ensemble de la flotte Kemet.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-modal-footer">
                                    <button type="button" className="action-btn-secondary" onClick={closeModal}>Annuler</button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="action-btn-primary"
                                    >
                                        {editingFeature ? 'Enregistrer les modifications' : 'Lancer le service'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .store-container { 
          max-width: 1400px; 
          margin: 0 auto; 
          display: flex; 
          flex-direction: column; 
          gap: 32px; 
          padding-bottom: 40px; 
        }

        .store-header { display: flex; justify-content: space-between; align-items: center; }
        .store-header h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
        .add-btn { background: var(--accent-primary); color: white; padding: 12px 24px; border-radius: 12px; border: none; display: flex; align-items: center; gap: 10px; font-weight: 700; cursor: pointer; }
        
        .filters-bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .search-box { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .search-box input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 16px; padding: 14px 45px; color: white; outline: none; }
        .view-stats { color: var(--text-secondary); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .feature-card { border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); transition: all 0.3s; }
        .feature-card:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); }

        .card-image { height: 160px; position: relative; background: rgba(0,0,0,0.3); }
        .image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .image-placeholder.blue { color: #3B82F6; background: linear-gradient(135deg, rgba(59,130,246,0.1), transparent); }
        .image-placeholder.amber { color: #FBBF24; background: linear-gradient(135deg, rgba(251,191,36,0.1), transparent); }
        
        .card-type-tag { position: absolute; bottom: 12px; left: 12px; padding: 4px 10px; border-radius: 8px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-type-tag.blue { background: #3B82F6; color: white; }
        .card-type-tag.amber { background: #FBBF24; color: black; }

        .card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .feature-title { font-size: 16px; font-weight: 800; }
        .feature-tech-code { font-size: 9px; font-weight: 700; color: var(--accent-primary); opacity: 0.8; font-family: 'JetBrains Mono', monospace; display: block; margin-top: 2px; }
        .card-actions { display: flex; gap: 6px; }
        .row-action-btn { padding: 4px; border-radius: 6px; border: none; background: rgba(255,255,255,0.05); color: var(--text-secondary); cursor: pointer; }
        .row-action-btn:hover { background: white; color: black; }
        .feature-description { font-size: 12px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.4; }

        .card-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 16px; margin-bottom: 24px; }
        .metric-box { display: flex; flex-direction: column; gap: 2px; }
        .m-icon { margin-bottom: 4px; }
        .m-val { font-size: 14px; font-weight: 800; }
        .m-label { font-size: 8px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; }

        .card-bottom-info { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .price-container { display: flex; align-items: baseline; gap: 4px; }
        .p-currency { font-size: 10px; font-weight: 700; color: var(--accent-primary); }
        .p-amount { font-size: 18px; font-weight: 900; color: white; }
        .p-period { font-size: 12px; color: var(--text-secondary); }
        .status-pill { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); }
        .s-dot { width: 6px; height: 6px; border-radius: 50%; }
        .s-dot.on { background: #10B981; box-shadow: 0 0 10px #10B981; }

        /* PREMIUM MODAL */
        .premium-modal-overlay {
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); 
          backdrop-filter: blur(12px);
          display: flex; 
          justify-content: center;
          align-items: center;
          z-index: 9999; 
          padding: 20px;
          padding-left: 280px; /* Account for 260px sidebar + gap */
          overflow-y: auto;
        }
        .premium-modal-content {
          background: #0F0F12;
          border: 1px solid rgba(255,255,255,0.1);
          width: 100%; 
          max-width: 860px;
          border-radius: 32px; 
          position: relative;
          padding: 40px;
          margin: auto; /* Robust centering in flex container */
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8);
          animation: modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-glow-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--accent-primary), #3B82F6, #FBBF24);
          opacity: 0.4;
        }
        .premium-close-btn {
          position: absolute; top: 20px; right: 20px;
          width: 36px; height: 36px; border-radius: 50%;
          border: none; background: rgba(255,255,255,0.03); color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .premium-close-btn:hover { background: rgba(255,255,255,0.08); transform: rotate(90deg); }

        .premium-modal-header { display: flex; gap: 20px; align-items: center; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; }
        .header-icon-container {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, var(--accent-primary), rgba(255,255,255,0.05));
          display: flex; align-items: center; justify-content: center;
          color: white; border: 1px solid rgba(255,255,255,0.1);
        }
        .icon-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        
        .header-text h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .header-text p { color: var(--text-secondary); font-size: 13px; opacity: 0.6; }

        .premium-form { display: flex; flex-direction: column; gap: 32px; }
        .form-layout-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; }
        .form-column { display: flex; flex-direction: column; gap: 24px; }
        .input-section-title { font-size: 10px; font-weight: 900; letter-spacing: 1.5px; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; opacity: 0.8; }
        
        .premium-input-field { display: flex; flex-direction: column; gap: 8px; }
        .premium-input-field label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        
        .input-with-icon { position: relative; }
        .field-icon { position: absolute; left: 14px; top: 14px; color: var(--text-secondary); opacity: 0.4; }
        .field-symbol { position: absolute; left: 14px; top: 14px; font-size: 11px; font-weight: 900; color: var(--accent-primary); }
        
        .input-with-icon input, .premium-input-field textarea, .select-wrapper select {
          width: 100%; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: white; padding: 0 16px; font-size: 14px; transition: all 0.2s;
        }
        .input-with-icon input { padding-left: 40px; }
        .premium-input-field textarea { height: auto; padding: 12px; resize: none; font-family: inherit; }
        .input-with-icon input:focus, .premium-input-field textarea:focus { border-color: var(--accent-primary); background: rgba(255,255,255,0.04); outline: none; }

        .dark-section { background: rgba(255,255,255,0.01); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); }
        .select-wrapper { position: relative; }
        .select-wrapper select { appearance: none; cursor: pointer; }
        .select-wrapper::after { content: '▾'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); font-size: 12px; }

        .tier-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-alert { display: flex; gap: 10px; padding: 14px; background: rgba(59,130,246,0.05); border-radius: 12px; color: #60A5FA; font-size: 11px; margin-top: 10px; border: 1px solid rgba(59,130,246,0.1); line-height: 1.4; }

        .premium-modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; }
        .action-btn-secondary { padding: 10px 24px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: white; cursor: pointer; font-weight: 600; font-size: 14px; }
        .action-btn-primary { padding: 10px 32px; border-radius: 10px; border: none; background: var(--accent-primary); color: white; font-weight: 700; cursor: pointer; font-size: 14px; }

        .premium-toggle-simple {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.03); 
          padding: 8px 16px; border-radius: 12px;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s;
          font-size: 13px; font-weight: 600;
        }
        .premium-toggle-simple.on { border-color: var(--accent-primary); background: rgba(16, 185, 129, 0.05); }
        .toggle-thumb {
          width: 36px; height: 18px; background: rgba(255,255,255,0.1); 
          border-radius: 20px; position: relative; transition: all 0.3s;
        }
        .toggle-thumb::after {
          content: ''; position: absolute; left: 2px; top: 2px;
          width: 14px; height: 14px; background: white; border-radius: 50%;
          transition: all 0.3s;
        }
        .premium-toggle-simple.on .toggle-thumb { background: var(--accent-primary); }
        .premium-toggle-simple.on .toggle-thumb::after { left: 20px; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .hidden { display: none; }
        .empty-state { text-align: center; padding: 80px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; }
      `}</style>
        </div>
    );
}
