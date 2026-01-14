"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [type, setType] = useState('SUPPORT');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/requests/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setRequests(data);
            } else {
                setError('Impossible de charger vos requêtes.');
                setRequests([]);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
            setError('Erreur lors du chargement des requêtes.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, subject, description })
            });

            if (res.ok) {
                setSuccess('Demande envoyée avec succès !');
                setError('');
                setIsAdding(false);
                setSubject('');
                setDescription('');
                fetchRequests();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                const data = await res.json();
                setError(data.error || 'Une erreur est survenue lors de l\'envoi.');
            }
        } catch (error) {
            console.error('Submit request error:', error);
            setError('Impossible de se connecter au serveur.');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', label: 'Ouvert' };
            case 'IN_PROGRESS': return { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', label: 'En cours' };
            case 'RESOLVED': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'Résolu' };
            default: return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9CA3AF', label: status };
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Support & Requêtes</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Une question ? Un problème ? Nous sommes là pour vous aider.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(true)}
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} /> Nouvelle requête
                </motion.button>
            </header>

            {success && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px' }}>
                    {success}
                </div>
            )}

            {error && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isAdding ? '1fr 1fr' : '1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel"
                            style={{
                                padding: '80px 40px',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px dashed var(--glass-border)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px'
                            }}>
                                <MessageSquare size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Aucune requête active</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                Vous n'avez pas encore envoyé de demande de support. Cliquez sur "Nouvelle requête" pour commencer.
                            </p>
                        </motion.div>
                    ) : (
                        requests.map(req => (
                            <motion.div
                                key={req.request_id}
                                whileHover={{ y: -4, background: 'rgba(255,255,255,0.04)' }}
                                className="glass-panel"
                                style={{
                                    padding: '28px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--glass-border)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    background: getStatusStyle(req.status).color
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        background: getStatusStyle(req.status).bg,
                                        color: getStatusStyle(req.status).color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {req.status === 'OPEN' && <AlertCircle size={14} />}
                                        {req.status === 'IN_PROGRESS' && <Clock size={14} />}
                                        {req.status === 'RESOLVED' && <CheckCircle size={14} />}
                                        {getStatusStyle(req.status).label}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'white' }}>{req.subject}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>{req.description}</p>

                                {req.admin_notes && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            padding: '20px',
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(16, 185, 129, 0.1)',
                                            marginTop: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ padding: '4px', background: 'var(--accent-primary)', borderRadius: '4px' }}>
                                                <Send size={12} color="white" />
                                            </div>
                                            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réponse support</p>
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
                            className="glass-panel"
                            style={{
                                padding: '40px',
                                borderRadius: 'var(--radius-md)',
                                alignSelf: 'start',
                                border: '1px solid var(--accent-primary)',
                                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Nouvelle demande</h2>
                                <motion.button
                                    whileHover={{ rotate: 90, background: 'rgba(255,255,255,0.1)' }}
                                    onClick={() => setIsAdding(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type de demande</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '15px' }}
                                    >
                                        <option value="SUPPORT">Support Technique</option>
                                        <option value="SERVICE">Entretien / Service</option>
                                        <option value="FEATURE">Suggestion de fonctionnalité</option>
                                        <option value="BUG">Rapport de bug</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sujet</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '15px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description détaillée</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        placeholder="Décrivez votre problème ou votre demande..."
                                        rows={6}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: 'var(--radius-sm)', color: 'white', resize: 'none', fontSize: '15px', lineHeight: '1.6' }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    style={{
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: 'none',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        marginTop: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
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
