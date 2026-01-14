"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Smartphone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        id: string;
        name: string;
        price: number;
        interval: string;
    };
}

const operators = [
    { id: 'MTN', name: 'MTN Mobile Money', color: '#FFCC00', textColor: '#000' },
    { id: 'Moov', name: 'Moov Money', color: '#0066cc', textColor: '#fff' },
    { id: 'Celtiis', name: 'Celtiis Cash', color: '#e30613', textColor: '#fff' },
];

export default function SubscriptionModal({ isOpen, onClose, plan }: SubscriptionModalProps) {
    const [step, setStep] = useState(1); // 1: Choose Operator, 2: Phone Number, 3: Processing, 4: Result
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

    if (!isOpen) return null;

    const handleOperatorSelect = (op: any) => {
        setSelectedOperator(op);
        setStep(2);
    };

    const handlePayment = async () => {
        setStep(3);
        try {
            const token = localStorage.getItem('token');

            // 1. Create payment
            const createRes = await fetch('http://localhost:5001/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    feature_id: plan.id,
                    operator: selectedOperator.id,
                    phone_number: phoneNumber,
                    amount: plan.price
                })
            });
            const paymentData = await createRes.json();

            // 2. Simulate validation
            const simulateRes = await fetch(`http://localhost:5001/api/payments/${paymentData.payment_id}/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const resultData = await simulateRes.json();

            if (resultData.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
            setStep(4);
        } catch (err) {
            console.error('Payment error:', err);
            setStatus('error');
            setStep(4);
        }
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{ width: '400px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>S'abonner</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{plan.name} - {plan.price.toLocaleString()} FCFA / {plan.interval}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Choisissez votre opérateur</p>
                                {operators.map(op => (
                                    <button
                                        key={op.id}
                                        onClick={() => handleOperatorSelect(op)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: op.textColor }}>
                                            {op.id.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{op.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>
                                ← Retour
                            </button>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Paiement via {selectedOperator.name}</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Numéro Mobile Money</label>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0 16px' }}>
                                        <Smartphone size={20} color="var(--text-secondary)" />
                                        <input
                                            autoFocus
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="60 00 00 00"
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '16px 12px', outline: 'none', fontSize: '18px', fontWeight: 600 }}
                                        />
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Total à payer</span>
                                        <span style={{ fontWeight: 'bold' }}>{plan.price.toLocaleString()} FCFA</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={!phoneNumber}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: phoneNumber ? 'pointer' : 'not-allowed',
                                        opacity: phoneNumber ? 1 : 0.5
                                    }}
                                >
                                    Payer maintenant
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                <Loader2 size={64} className="animate-spin" color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Paiement en cours...</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Veuillez valider la transaction sur votre téléphone.</p>

                            <style dangerouslySetInnerHTML={{
                                __html: `
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              `}} />
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                {status === 'success' ? (
                                    <CheckCircle2 size={80} color="#10B981" />
                                ) : (
                                    <AlertCircle size={80} color="#EF4444" />
                                )}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                                {status === 'success' ? 'Paiement réussi !' : 'Paiement échoué'}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                {status === 'success'
                                    ? 'Votre abonnement a été activé avec succès.'
                                    : 'Une erreur est survenue lors du traitement. Veuillez réessayer.'}
                            </p>

                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    border: '1px solid var(--glass-border)',
                                    cursor: 'pointer'
                                }}
                            >
                                Fermer
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
