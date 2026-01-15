"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Loader2, Send, User, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function RequestsManagerPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState('');
    const [notification, setNotification] = useState<any>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (selectedRequest) {
            setAdminNotes(selectedRequest.admin_notes || '');
        }
    }, [selectedRequest]);

    const fetchRequests = async () => {
        setLoading(true);
        console.log('Fetching requests from view...');

        // Fetch from the new View (tickets_and_users)
        const { data, error } = await supabase
            .from('tickets_and_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching requests from view:', error);
            showNotification('Erreur de chargement: ' + error.message, 'error');
        } else {
            console.log('Requests fetched from view:', data);
            if (data) setRequests(data);
        }
        setLoading(false);
    };

    const updateTicketStatus = async (ticketId: string, status: string) => {
        const { error } = await supabase
            .from('support_tickets') // Updates still go to the real table
            .update({
                status,
                resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null
            })
            .eq('id', ticketId);

        if (!error) {
            showNotification('Statut mis à jour', 'success');
            fetchRequests(); // View will update automatically
            if (selectedRequest?.id === ticketId) {
                setSelectedRequest({ ...selectedRequest, status });
            }
        }
    };

    const saveAdminNotes = async () => {
        if (!selectedRequest) return;

        const { error } = await supabase
            .from('support_tickets') // Updates still go to the real table
            .update({
                admin_notes: adminNotes,
                admin_id: user?.id
            })
            .eq('id', selectedRequest.id);

        if (!error) {
            showNotification('Réponse enregistrée', 'success');
            fetchRequests();
        } else {
            showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Ouvert', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)' };
            case 'IN_PROGRESS':
                return { label: 'En cours', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'RESOLVED':
                return { label: 'Résolu', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'CLOSED':
                return { label: 'Fermé', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
            default:
                return { label: status, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    const getTypeLabel = (type: string) => {
        const types: any = {
            'SUPPORT': 'Support Technique',
            'SERVICE': 'Entretien / Service',
            'FEATURE': 'Suggestion',
            'BUG': 'Bug'
        };
        return types[type] || type;
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
        <div style={{ padding: '40px', height: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Gestion des Requêtes</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez les demandes de support des utilisateurs</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', height: 'calc(100% - 120px)' }}>
                {/* Liste des requêtes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '12px' }}>
                    {requests.map(req => (
                        <motion.div
                            key={req.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedRequest(req)}
                            className="glass-panel"
                            style={{
                                padding: '20px',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                border: selectedRequest?.id === req.id ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                background: selectedRequest?.id === req.id ? 'rgba(31, 111, 92, 0.1)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: getStatusStyle(req.status).bg,
                                    color: getStatusStyle(req.status).color
                                }}>
                                    {getStatusStyle(req.status).label}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'white' }}>{req.subject}</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {req.description}
                            </p>
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <User size={12} />
                                {/* Update usage to flattened view columns */}
                                {req.user_metadata?.name || req.user_email || 'Utilisateur'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Détails de la requête */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
                    {selectedRequest ? (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{selectedRequest.subject}</h2>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <User size={14} />
                                                {/* Update usage to flattened view columns */}
                                                {selectedRequest.user_metadata?.name || selectedRequest.user_email}
                                            </span>
                                            <span>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} />
                                                {new Date(selectedRequest.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        background: getStatusStyle(selectedRequest.status).bg,
                                        color: getStatusStyle(selectedRequest.status).color
                                    }}>
                                        {getStatusStyle(selectedRequest.status).label}
                                    </span>
                                </div>

                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Type: {getTypeLabel(selectedRequest.type)}
                                    </div>
                                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'white' }}>
                                        {selectedRequest.description}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                    <button
                                        onClick={() => updateTicketStatus(selectedRequest.id, 'IN_PROGRESS')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: selectedRequest.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: '#3B82F6',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px'
                                        }}
                                    >
                                        <Clock size={14} style={{ marginRight: '6px' }} />
                                        En cours
                                    </button>
                                    <button
                                        onClick={() => updateTicketStatus(selectedRequest.id, 'RESOLVED')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: selectedRequest.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: '#10B981',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px'
                                        }}
                                    >
                                        <CheckCircle size={14} style={{ marginRight: '6px' }} />
                                        Résolu
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Send size={18} color="var(--accent-primary)" />
                                    Réponse au client
                                </h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Rédigez votre réponse ici..."
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'white',
                                        resize: 'none',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        marginBottom: '16px'
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={saveAdminNotes}
                                    style={{
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '14px 28px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Send size={16} />
                                    Enregistrer la réponse
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <MessageSquare size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                            <p>Sélectionnez une requête pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                            color: 'white',
                            padding: '16px 32px',
                            borderRadius: 'calc(var(--radius-md) * 2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontWeight: 600,
                            fontSize: '15px'
                        }}
                    >
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
