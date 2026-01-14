"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Wifi, Search, X, Check, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';
import styles from './Store.module.css';

import { supabase } from '@/lib/supabase';

export default function Store() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalStep, setModalStep] = useState(1);
    const [frequency, setFrequency] = useState<'monthly' | 'annual' | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('store_features')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProducts(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProducts();

        const channel = supabase
            .channel('store-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'store_features' },
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['Tous', ...Array.from(cats)].filter(Boolean);
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'Tous' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, activeCategory]);

    const handleSelectFrequency = (freq: 'monthly' | 'annual') => {
        setFrequency(freq);
        setModalStep(2);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setModalStep(1);
        setFrequency(null);
    };

    const getPrice = () => {
        if (!selectedProduct) return 0;
        return frequency === 'annual' ? selectedProduct.price * 10 : selectedProduct.price;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Kemet Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Améliorez votre expérience de conduite.</p>
                </div>
            </header>

            {/* Search and Filters */}
            <div className={styles.searchFilterBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.filterChips}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.chip} ${activeCategory === cat ? styles.active : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero / Featured */}
            <div className={`glass-panel ${styles.featuredBanner}`}>
                <div style={{ maxWidth: '60%' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Essai de Mode Sentinelle</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Surveillez votre véhicule à 360° quand vous êtes stationné. 30 jours gratuits.</p>
                    <button className={styles.primaryButton} onClick={() => alert('Essai activé !')}>Activer l'essai</button>
                </div>
            </div>

            {/* Store Grid */}
            <div className={styles.storeGrid}>
                {filteredProducts.map(product => (
                    <StoreCard
                        key={product.id}
                        product={product}
                        onSubscribe={() => { setSelectedProduct(product); setModalStep(1); }}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && !isLoading && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p>Aucun produit ne correspond à votre recherche.</p>
                </div>
            )}

            {/* Subscription Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className={styles.modalOverlay} onClick={handleCloseModal}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`glass-panel ${styles.modalContent}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {modalStep === 2 && (
                                        <ArrowLeft
                                            size={20}
                                            style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            onClick={() => setModalStep(1)}
                                        />
                                    )}
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {modalStep === 1 ? "Choisir l'abonnement" : "Mode de paiement"}
                                    </h3>
                                </div>
                                <X size={24} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={handleCloseModal} />
                            </div>

                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                                {modalStep === 1 ? (
                                    <>Vous vous abonnez à <strong>{selectedProduct.title}</strong>. Choisissez la fréquence qui vous convient.</>
                                ) : (
                                    <>Souhaitez-vous régler la totalité maintenant ou opter pour un paiement fractionné ?</>
                                )}
                            </p>

                            {modalStep === 1 ? (
                                <div className={styles.subscriptionOptions}>
                                    <SubscriptionOption
                                        title="Mensuel"
                                        price={selectedProduct.price}
                                        period="mois"
                                        onClick={() => handleSelectFrequency('monthly')}
                                    />
                                    <SubscriptionOption
                                        title="Annuel"
                                        price={selectedProduct.price * 10}
                                        period="an"
                                        savings="Économisez 20%"
                                        onClick={() => handleSelectFrequency('annual')}
                                    />
                                </div>
                            ) : (
                                <div className={styles.paymentMethods}>
                                    <div className={styles.paymentOption} onClick={() => { alert('Paiement complet effectué'); handleCloseModal(); }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Paiement Intégral</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Réglez {getPrice().toLocaleString('fr-FR')} FCFA en une fois</div>
                                        </div>
                                        <ArrowRight size={18} color="var(--accent-primary)" />
                                    </div>

                                    <div className={styles.paymentOption} onClick={() => { alert('Paiement fractionné configuré'); handleCloseModal(); }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <div style={{ fontWeight: 600 }}>Paiement Fractionné</div>
                                                <span className={styles.installmentTag}>Populaire</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {frequency === 'monthly' ? (
                                                    <>2x {(getPrice() / 2).toLocaleString('fr-FR')} FCFA (Toutes les 2 semaines)</>
                                                ) : (
                                                    <>4x {(getPrice() / 4).toLocaleString('fr-FR')} FCFA (Mensuellement)</>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight size={18} color="var(--accent-primary)" />
                                    </div>

                                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '10px', alignItems: 'start' }}>
                                        <CreditCard size={16} style={{ marginTop: '2px', color: 'var(--text-secondary)' }} />
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                            Le paiement fractionné est sans frais supplémentaires. Votre carte sera débitée automatiquement selon l'échéancier choisi.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const StoreCard = ({ product, onSubscribe }: any) => {
    const isSubscription = product.price_annual_xof > 0;
    const formattedPrice = product.price_xof?.toLocaleString('fr-FR') + ' FCFA';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-panel ${styles.storeCard}`}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div className={styles.cardIconWrapper}>
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                        product.category === 'Performance' ? <Zap size={32} color="#FBBF24" /> : <Shield size={32} color="#10B981" />
                    )}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    {product.category}
                </span>
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{product.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>{product.description}</p>
            </div>
            <div className={styles.cardFooter}>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>À partir de</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{formattedPrice}{isSubscription ? ' / mois' : ''}</span>
                </div>
                <button
                    className={styles.secondaryButton}
                    style={{ width: '100%' }}
                    onClick={isSubscription ? onSubscribe : () => alert('Achat effectué !')}
                >
                    {isSubscription ? "S'abonner" : "Acheter"}
                </button>
            </div>
        </motion.div>
    );
}

const SubscriptionOption = ({ title, price, period, savings, onClick }: any) => (
    <div className={styles.optionCard} onClick={onClick}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>{title}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{price.toLocaleString('fr-FR')} FCFA</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>par {period}</div>
        {savings && (
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                {savings}
            </div>
        )}
    </div>
);
