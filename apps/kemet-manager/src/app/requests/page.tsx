"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../lib/api';
import {
    MessageSquare,
    Search,
    Filter,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Clock,
    Bot,
    User,
    Terminal,
    Save,
    RefreshCw,
    Mic,
    MicOff,
    Loader2
} from 'lucide-react';

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [adminNotes, setAdminNotes] = useState('');
    const [status, setStatus] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [streamingAnalysis, setStreamingAnalysis] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const data = await adminApi.getAllRequests();
            if (Array.isArray(data)) {
                setRequests(data);
                if (data.length > 0 && !selectedRequest) {
                    setSelectedRequest(data[0]);
                    setAdminNotes(data[0].admin_notes || '');
                    setStatus(data[0].status);
                    startAIAnalysis(data[0].request_id);
                }
            } else {
                setErrorMessage('Aucune donnée valide reçue du serveur.');
                setRequests([]);
            }
        } catch (error: any) {
            console.error('Fetch requests error:', error);
            setErrorMessage(error.message || 'Erreur lors de la récupération des requêtes');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedRequest) return;
        try {
            await adminApi.updateRequest(selectedRequest.request_id, status, adminNotes);
            fetchRequests();
            showNotification('Requête mise à jour avec succès !', 'success');
        } catch (error: any) {
            console.error('Update request error:', error);
            showNotification('Erreur lors de la mise à jour: ' + error.message, 'error');
        }
    };

    const filteredRequests = Array.isArray(requests) ? requests.filter(r => filter === 'ALL' || r.status === filter) : [];

    const startAIAnalysis = (id: string) => {
        setStreamingAnalysis('');
        setIsStreaming(true);

        const token = localStorage.getItem('admin_token');
        const eventSource = new EventSource(`http://localhost:5001/api/requests/analyze-stream/${id}?token=${token}`);

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
                setIsStreaming(false);
                return;
            }

            try {
                const data = JSON.parse(event.data);
                if (data.content) {
                    setStreamingAnalysis(prev => prev + data.content);
                }
                if (data.error) {
                    setStreamingAnalysis('Erreur stream IA: ' + data.error);
                    eventSource.close();
                    setIsStreaming(false);
                }
            } catch (e) {
                console.error('Error parsing SSE:', e);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            setIsStreaming(false);
        };
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: mimeType });
                showNotification('Transcription en cours...', 'success');
                try {
                    const data = await adminApi.transcribeVoice(blob);
                    setAdminNotes(prev => prev + (prev ? '\n' : '') + data.text);
                    showNotification('Transcription réussie !', 'success');
                } catch (err) {
                    showNotification('Erreur transcription', 'error');
                }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            showNotification('Microphone non accessible', 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleRegenerateAI = async () => {
        if (!selectedRequest) return;
        setIsStreaming(true);
        setStreamingAnalysis('Régénération de l\'analyse en cours...');
        try {
            const updated = await adminApi.regenerateAIAnalysis(selectedRequest.request_id);
            // After regeneration, start the streaming effect manually or just update the static analysis
            setRequests(prev => prev.map(r => r.request_id === updated.request_id ? updated : r));
            setSelectedRequest(updated);
            showNotification('Analyse régénérée !', 'success');
        } catch (err) {
            showNotification('Erreur lors de la régénération', 'error');
        } finally {
            setIsStreaming(false);
            setStreamingAnalysis('');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return <AlertCircle size={16} color="#3B82F6" />;
            case 'IN_PROGRESS': return <Clock size={16} color="#FBBF24" />;
            case 'RESOLVED': return <CheckCircle size={16} color="#10B981" />;
            default: return <MessageSquare size={16} />;
        }
    };

    let aiSolution = "Aucune analyse disponible.";
    if (selectedRequest?.ai_analysis) {
        try {
            const analysis = JSON.parse(selectedRequest.ai_analysis);
            aiSolution = analysis.solution || aiSolution;
        } catch (e) {
            console.error('Failed to parse AI analysis:', e);
            aiSolution = selectedRequest.ai_analysis; // Fallback to raw text if it's not JSON
        }
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', margin: '-32px' }}>
            {/* List Sidebar */}
            <div style={{
                width: '350px',
                borderRight: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {errorMessage && (
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} /> {errorMessage}
                    </div>
                )}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Requêtes Clients</h2>
                        <button
                            onClick={fetchRequests}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex' }}
                            title="Rafraîchir"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                padding: '8px',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                fontSize: '12px'
                            }}
                        >
                            <option value="ALL">Tout</option>
                            <option value="OPEN">Ouvert</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="RESOLVED">Résolu</option>
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <p style={{ padding: '20px', textAlign: 'center' }}>Chargement...</p>
                    ) : filteredRequests.length === 0 ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune requête trouvée.</p>
                    ) : (
                        filteredRequests.map(req => (
                            <div
                                key={req.request_id}
                                onClick={() => {
                                    setSelectedRequest(req);
                                    setAdminNotes(req.admin_notes || '');
                                    setStatus(req.status);
                                    startAIAnalysis(req.request_id);
                                }}
                                style={{
                                    padding: '16px 24px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    background: selectedRequest?.request_id === req.request_id ? 'rgba(31, 111, 92, 0.1)' : 'transparent',
                                    borderLeft: selectedRequest?.request_id === req.request_id ? '4px solid var(--accent-primary)' : '4px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{req.type}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{req.subject}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {getStatusIcon(req.status)}
                                    {req.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: 'var(--bg-primary)' }}>
                {selectedRequest ? (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedRequest.subject}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        <User size={16} /> {selectedRequest.first_name} {selectedRequest.last_name} ({selectedRequest.email})
                                    </div>
                                    <div style={{ borderLeft: '1px solid var(--glass-border)', height: '16px' }}></div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        ID: {selectedRequest.request_id}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '10px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                >
                                    <option value="OPEN">OUVERT</option>
                                    <option value="IN_PROGRESS">EN COURS</option>
                                    <option value="RESOLVED">RÉSOLU</option>
                                    <option value="CLOSED">FERMÉ</option>
                                </select>
                                <button
                                    onClick={handleUpdate}
                                    style={{ background: 'var(--accent-primary)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <Save size={18} /> Enregistrer
                                </button>
                            </div>
                        </div>

                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={20} color="var(--accent-primary)" /> Description du client
                            </h3>
                            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', fontSize: '15px', lineHeight: '1.6' }}>
                                {selectedRequest.description}
                            </div>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <section>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Terminal size={20} color="var(--accent-primary)" /> Notes internes / Réponse
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        style={{
                                            background: isRecording ? '#EF4444' : 'rgba(255,255,255,0.05)',
                                            border: 'none',
                                            color: 'white',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                        title={isRecording ? "Arrêter l'enregistrement" : "Dicter une note (Whisper)"}
                                    >
                                        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                                    </motion.button>
                                </h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Ajouter une note ou une réponse pour l'utilisateur..."
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
                                        lineHeight: '1.5'
                                    }}
                                />
                            </section>

                            <section>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Bot size={20} color="#10B981" /> Assistant IA (Solutions Dev)
                                        {isStreaming && <Loader2 size={16} className="animate-spin" />}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleRegenerateAI}
                                        disabled={isStreaming}
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: 'none',
                                            color: '#10B981',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                        title="Régénérer l'analyse"
                                    >
                                        <RefreshCw size={14} />
                                    </motion.button>
                                </h3>
                                <div style={{
                                    padding: '24px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    color: '#10B981',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-line',
                                    minHeight: '100px'
                                }}>
                                    <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>
                                        {isStreaming ? 'Analyse en temps réel...' : 'Analyse automatisée'}
                                    </div>
                                    {isStreaming ? streamingAnalysis : (() => {
                                        if (!selectedRequest?.ai_analysis) return "Aucune analyse disponible.";
                                        try {
                                            const parsed = JSON.parse(selectedRequest.ai_analysis);
                                            return parsed.solution || selectedRequest.ai_analysis;
                                        } catch (e) {
                                            return selectedRequest.ai_analysis;
                                        }
                                    })()}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <MessageSquare size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p>Sélectionnez une requête pour voir les détails</p>
                    </div>
                )}
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
