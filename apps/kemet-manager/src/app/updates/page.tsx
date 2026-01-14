"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, CheckCircle, AlertCircle, Clock, X, BarChart3,
    TrendingUp, RotateCcw, Activity, Filter, ChevronRight,
    Zap, ShieldCheck, Download, History, Database, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<any[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [version, setVersion] = useState('');
    const [notes, setNotes] = useState('');
    const [title, setTitle] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch updates from Supabase
    const fetchUpdates = async () => {
        const { data, error } = await supabase
            .from('software_updates')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUpdates(data);
            if (data.length > 0 && !selectedVersionId) {
                setSelectedVersionId(data[0].id);
            }
        }
    };

    useEffect(() => {
        fetchUpdates();

        // Real-time subscription
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'software_updates' },
                () => {
                    fetchUpdates();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const selectedVersion = updates.find(v => v.id === selectedVersionId) || updates[0];

    useEffect(() => {
        const initializeAdmin = async () => {
            // Simplified for POC
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    // Redirect to login or handled by layout
                }
            } catch (err) {
                console.error('Admin initialization failed:', err);
            }
        };
        initializeAdmin();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!version || !notes || !selectedFile) {
            setError('Version, notes et fichier de build sont requis');
            return;
        }

        setDeploying(true);
        setError('');
        setSuccess('');

        try {
            // 1. Simulate Upload Progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            // 2. Insert into Supabase
            const { data, error } = await supabase
                .from('software_updates')
                .insert([{
                    version,
                    release_notes: notes,
                    is_published: true, // Auto-publish for POC
                    file_url: `/builds/${selectedFile.name}` // Placeholder URL
                }])
                .select();

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (error) throw error;

            setSuccess(`Mise à jour ${version} déployée avec succès !`);
            setVersion('');
            setNotes('');
            setSelectedFile(null);

            setTimeout(() => {
                setSuccess('');
                setUploadProgress(0);
                setIsModalOpen(false);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du déploiement');
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="updates-container custom-scrollbar">
            {/* Main Header */}
            <header className="page-header">
                <div>
                    <h1>FOTA Control Center</h1>
                    <p>Gestionnaire de cycles de vie firmware et déploiements OTA</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px var(--accent-glow)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="publish-btn"
                >
                    <UploadCloud size={18} />
                    Nouveau Build
                </motion.button>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedVersionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="content-flow"
                >
                    {selectedVersion ? (
                        <>
                            {/* Top Section: Metrics */}
                            <section className="analytics-section">
                                <div className="section-header">
                                    <div className="title-row">
                                        <TrendingUp size={20} color="var(--accent-primary)" />
                                        <h2>Performance de {selectedVersion.version}</h2>
                                        <span className={`type-badge ${selectedVersion.status}`}>{selectedVersion.type}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span><Download size={14} /> {selectedVersion.devices} Appareils</span>
                                        <span><ShieldCheck size={14} /> {selectedVersion.details?.security} Sec.</span>
                                        <span><Database size={14} /> {selectedVersion.details?.size}</span>
                                    </div>
                                </div>

                                <div className="analytics-grid">
                                    <GlassCard
                                        icon={<TrendingUp color="#10B981" />}
                                        label="Taux de réussite"
                                        value={selectedVersion?.success_rate || "98.2%"} // Falls back to default if not yet tracked
                                        trend="Global stable"
                                        color="green"
                                    />
                                    <GlassCard
                                        icon={<Clock color="#3B82F6" />}
                                        label="Temps Moyen"
                                        value={selectedVersion?.avg_time || "4m 23s"}
                                        trend="Stable"
                                        color="blue"
                                    />
                                    <GlassCard
                                        icon={<RotateCcw color="#FBBF24" />}
                                        label="Reprises (Cut)"
                                        value={selectedVersion?.resumes || "142"}
                                        trend="Optimisé"
                                        color="amber"
                                    />
                                    <GlassCard
                                        icon={<Activity color="#EF4444" />}
                                        label="Rollbacks"
                                        value={selectedVersion?.rollbacks || "3"}
                                        trend="Taux < 1.2%"
                                        color="red"
                                    />
                                </div>
                            </section>

                            {/* Middle Section: Details & Fragmentation */}
                            <div className="details-grid">
                                <section className="info-block">
                                    <div className="block-title">
                                        <BarChart3 size={18} />
                                        NOTES DE RELEASE
                                    </div>
                                    <div className="notes-box">
                                        <pre className="notes-text">{selectedVersion?.release_notes || "Aucune note disponible."}</pre>
                                    </div>
                                </section>

                                <section className="info-block">
                                    <div className="block-title">
                                        <Zap size={18} />
                                        RÉPARTITION FLOTTE
                                    </div>
                                    <div className="fragmentation-box">
                                        <div className="progress-stack">
                                            <div style={{ width: '65%' }} className="stack-item stable">65%</div>
                                            <div style={{ width: '25%' }} className="stack-item legacy">25%</div>
                                            <div style={{ width: '10%' }} className="stack-item others">10%</div>
                                        </div>
                                        <div className="stack-legend">
                                            <div className="legend-item"><span className="dot stable" /> v2.4.1 (Stable)</div>
                                            <div className="legend-item"><span className="dot legacy" /> v2.4.0 (Ancien)</div>
                                            <div className="legend-item"><span className="dot others" /> Autres</div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                            <p>Chargement des données de version...</p>
                        </div>
                    )}

                    {/* Bottom Section: History (Build Selector) */}
                    <section className="history-section">
                        <div className="section-title">
                            <History size={18} />
                            BUILDS PRÉCÉDENTS
                        </div>
                        <div className="history-horizontal-scroll custom-scrollbar">
                            {updates.map((v) => (
                                <motion.div
                                    key={v.id}
                                    whileHover={{ y: -4, background: 'rgba(255,255,255,0.05)' }}
                                    onClick={() => setSelectedVersionId(v.id)}
                                    className={`history-card ${selectedVersionId === v.id ? 'active' : ''}`}
                                >
                                    <div className={`status-line ${v.is_published ? 'success' : ''}`} />
                                    <div className="card-top">
                                        <span className="v-num">{v.version}</span>
                                        <span className="v-type">{v.is_published ? 'Stable' : 'Draft'}</span>
                                    </div>
                                    <div className="card-bottom">
                                        <span className="v-date">{new Date(v.created_at).toLocaleDateString()}</span>
                                        {selectedVersionId === v.id && (
                                            <motion.div layoutId="arrow" className="active-arrow">
                                                <ArrowRight size={14} />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </motion.div>
            </AnimatePresence>

            {/* Modal: Deployment Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => !deploying && setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="modal-content custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>

                            <div className="modal-header">
                                <div className="icon-box"><UploadCloud size={24} /></div>
                                <h2>Nouveau Déploiement FOTA</h2>
                                <p>Préparez un cycle de mise à jour sécurisé pour vos véhicules.</p>
                            </div>

                            {error && <div className="error-alert">{error}</div>}
                            {success && <div className="success-alert">{success}</div>}

                            <form onSubmit={handleDeploy} className="deploy-form">
                                <div className="input-group" style={{ marginBottom: '16px' }}>
                                    <label>Nom de la Release</label>
                                    <input type="text" placeholder="ex: Kemet Core v2.5" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Version du Build</label>
                                        <input type="text" placeholder="ex: 2.5.0" value={version} onChange={e => setVersion(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Priorité</label>
                                        <select>
                                            <option>Normale</option>
                                            <option>Critique</option>
                                            <option>Hotfix</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="upload-zone">
                                    <label className={`upload-box ${selectedFile ? 'has-file' : ''}`}>
                                        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".zip,.bin" />
                                        <div className="upload-content">
                                            <Download size={24} className="dl-icon" />
                                            <span className="main-text">{selectedFile ? selectedFile.name : 'Sélectionner le package binaire'}</span>
                                            {selectedFile && <span className="sub-text">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>}
                                        </div>
                                        {deploying && (
                                            <div className="progress-bar-container">
                                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div className="input-group">
                                    <label>Notes de Version</label>
                                    <textarea rows={4} placeholder="Détails techniques du build..." value={notes} onChange={e => setNotes(e.target.value)} />
                                </div>

                                <button type="submit" disabled={deploying} className="submit-deploy">
                                    {deploying ? `Déploiement en cours... ${uploadProgress}%` : 'Lancer la Campagne'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .updates-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    height: calc(100vh - 80px);
                    overflow-y: auto;
                    font-family: 'Inter', sans-serif;
                }

                /* Header */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .page-header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                .page-header p { color: var(--text-secondary); font-size: 14px; }
                .publish-btn { 
                    background: var(--accent-primary); 
                    color: white; 
                    padding: 12px 28px; 
                    border-radius: 12px; 
                    font-weight: 700; 
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                }

                .content-flow { display: flex; flex-direction: column; gap: 40px; }

                /* Analytics Section (TOP) */
                .analytics-section { display: flex; flex-direction: column; gap: 24px; }
                .section-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .title-row { display: flex; align-items: center; gap: 12px; }
                .title-row h2 { font-size: 22px; font-weight: 800; }
                .meta-row { display: flex; gap: 20px; color: var(--text-secondary); font-size: 13px; margin-top: 8px; }
                .meta-row span { display: flex; align-items: center; gap: 6px; }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                .glass-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .gc-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .gc-icon.green { background: rgba(16, 185, 129, 0.1); }
                .gc-icon.blue { background: rgba(59, 130, 246, 0.1); }
                .gc-icon.amber { background: rgba(251, 191, 36, 0.1); }
                .gc-icon.red { background: rgba(239, 68, 68, 0.1); }
                .gc-label { color: var(--text-secondary); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .gc-value { font-size: 22px; font-weight: 800; color: white; }
                .gc-trend { font-size: 11px; color: var(--text-secondary); font-weight: 500; }

                /* Details Grid (MIDDLE) */
                .details-grid { display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px; }
                .info-block { display: flex; flex-direction: column; gap: 16px; }
                .block-title { font-size: 12px; font-weight: 800; letter-spacing: 1px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; }
                .notes-box { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 24px; padding: 24px; min-height: 180px; }
                .notes-text { font-family: inherit; font-size: 14px; line-height: 1.8; color: #cbd5e1; white-space: pre-line; }

                .fragmentation-box { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 24px; padding: 24px; }
                .progress-stack { height: 32px; display: flex; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
                .stack-item { display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; }
                .stack-item.stable { background: var(--accent-primary); }
                .stack-item.legacy { background: #FBBF24; color: black; }
                .stack-item.others { background: #3B82F6; }
                .stack-legend { display: flex; flex-direction: column; gap: 12px; }
                .legend-item { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-secondary); }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .dot.stable { background: var(--accent-primary); }
                .dot.legacy { background: #FBBF24; }
                .dot.others { background: #3B82F6; }

                /* History Section (BOTTOM) */
                .history-section { display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px; }
                .section-title { font-size: 13px; font-weight: 800; letter-spacing: 1px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; }
                .history-horizontal-scroll { 
                    display: flex; 
                    gap: 16px; 
                    overflow-x: auto; 
                    padding-bottom: 16px; 
                }
                .history-card {
                    min-width: 240px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 20px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }
                .history-card.active { border-color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.05); }
                .status-line { position: absolute; top: 0; left: 24px; right: 24px; height: 3px; border-radius: 0 0 4px 4px; }
                .status-line.success { background: #10B981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                .status-line.warning { background: #EF4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
                .status-line.patch { background: #3B82F6; }
                
                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; margin-top: 4px; }
                .v-num { font-weight: 800; font-size: 18px; color: white; }
                .v-type { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); opacity: 0.8; }
                .card-bottom { display: flex; justify-content: space-between; align-items: center; }
                .active-arrow { color: var(--accent-primary); }

                /* Shared & Types */
                .type-badge { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px; }
                .type-badge.success { background: rgba(16, 185, 129, 0.1); color: #10B981; }
                .type-badge.warning { background: rgba(239, 68, 68, 0.1); color: #EF4444; }

                /* Modal styling from previous */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(20px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .modal-content {
                    background: rgba(20, 20, 25, 0.9);
                    border: 1px solid var(--glass-border);
                    border-radius: 32px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 40px;
                    position: relative;
                }
                .close-btn { position: absolute; top: 24px; right: 24px; background: none; border: none; color: var(--text-secondary); cursor: pointer; }
                .modal-header { text-align: center; margin-bottom: 40px; }
                .icon-box { 
                    width: 64px; height: 64px; background: rgba(var(--accent-primary-rgb), 0.1); 
                    border-radius: 20px; display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px; color: var(--accent-primary);
                }
                .modal-header h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
                .modal-header p { color: var(--text-secondary); font-size: 14px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .input-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                .input-group input, .input-group select, .input-group textarea {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 14px;
                    color: white;
                    font-size: 14px;
                    outline: none;
                }
                .upload-box {
                    border: 2px dashed var(--glass-border);
                    border-radius: 20px;
                    padding: 32px;
                    display: block;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }
                .upload-box.has-file { border-color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.05); }
                .dl-icon { color: var(--text-secondary); margin-bottom: 12px; }
                .main-text { display: block; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
                .sub-text { font-size: 11px; color: var(--text-secondary); }
                .submit-deploy {
                    width: 100%;
                    padding: 16px;
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 14px;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px var(--accent-glow);
                }
                .progress-bar-container { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.1); }
                .progress-bar-fill { height: 100%; background: var(--accent-primary); transition: width 0.2s; }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                
                :root {
                    --accent-primary-rgb: 45, 106, 79;
                }
            `}</style>
        </div>
    );
}

const GlassCard = ({ icon, label, value, trend, color }: any) => (
    <div className="glass-card">
        <div className={`gc-icon ${color}`}>{icon}</div>
        <div className="gc-label">{label}</div>
        <div className="gc-value">{value}</div>
        <div className="gc-trend">{trend}</div>
    </div>
);
