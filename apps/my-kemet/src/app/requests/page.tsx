"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Requests.module.css';

export default function RequestsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [type, setType] = useState('SUPPORT');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setRequests(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user?.id,
                type,
                subject,
                description,
                status: 'OPEN'
            });

        if (!error) {
            setIsAdding(false);
            setSubject('');
            setDescription('');
            setType('SUPPORT');
            fetchRequests();
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Ouvert', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)' };
            case 'IN_PROGRESS':
                return { label: 'En cours', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'RESOLVED':
                return { label: 'Résolu', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            default:
                return { label: status, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Support</h1>
                    <p className={styles.subtitle}>Gérez vos demandes d'assistance</p>
                </div>
                {!isAdding && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        className={styles.newRequestButton}
                    >
                        <Plus size={20} /> Nouvelle requête
                    </motion.button>
                )}
            </div>

            <div className={`${styles.contentGrid} ${isAdding ? styles.split : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.glassPanel} ${styles.emptyState}`}
                        >
                            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                                Aucune demande pour le moment. Cliquez sur "Nouvelle requête" pour commencer.
                            </p>
                        </motion.div>
                    ) : (
                        requests.map(req => (
                            <motion.div
                                key={req.id}
                                whileHover={{ y: -4, background: 'rgba(255,255,255,0.04)' }}
                                className={`glass-panel ${styles.requestCard}`}
                            >
                                <div className={styles.statusIndicator} style={{ background: getStatusStyle(req.status).color }} />

                                <div className={styles.cardHeader}>
                                    <span className={styles.statusBadge} style={{ background: getStatusStyle(req.status).bg, color: getStatusStyle(req.status).color }}>
                                        {req.status === 'OPEN' && <AlertCircle size={14} />}
                                        {req.status === 'IN_PROGRESS' && <Clock size={14} />}
                                        {req.status === 'RESOLVED' && <CheckCircle size={14} />}
                                        {getStatusStyle(req.status).label}
                                    </span>
                                    <span className={styles.date}>
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className={styles.subject}>{req.subject}</h3>
                                <p className={styles.description}>{req.description}</p>

                                {req.admin_notes && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={styles.adminResponse}
                                    >
                                        <div className={styles.adminBadge}>
                                            <div className={styles.adminIcon}>
                                                <Send size={12} color="white" />
                                            </div>
                                            <p className={styles.adminLabel}>Réponse support</p>
                                        </div>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>{req.admin_notes}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className={`glass-panel ${styles.formPanel}`}
                        >
                            <div className={styles.formHeader}>
                                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Nouvelle demande</h2>
                                <motion.button
                                    whileHover={{ rotate: 90, background: 'rgba(255,255,255,0.1)' }}
                                    onClick={() => setIsAdding(false)}
                                    className={styles.closeButton}
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Type de demande</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="SUPPORT">Support Technique</option>
                                        <option value="SERVICE">Entretien / Service</option>
                                        <option value="FEATURE">Suggestion de fonctionnalité</option>
                                        <option value="BUG">Rapport de bug</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sujet</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Description détaillée</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        placeholder="Décrivez votre problème ou votre demande..."
                                        rows={6}
                                        className={styles.textarea}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    <Send size={18} /> Envoyer la demande
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
