'use client';

import { useState } from 'react';

interface MoMoPaymentProps {
    featureId: string;
    featureName: string;
    price: number;
    vehicleId: string;
    userId: string;
}

export default function MoMoPayment({
    featureId,
    featureName,
    price,
    vehicleId,
    userId,
}: MoMoPaymentProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const handlePayment = async () => {
        if (!phoneNumber) {
            setMessage('Veuillez entrer votre numéro de téléphone');
            return;
        }

        setLoading(true);
        setStatus('pending');
        setMessage('Envoi de la demande de paiement...');

        try {
            // Initiate payment
            const response = await fetch('/api/payments/momo/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    featureId,
                    vehicleId,
                    userId,
                    phoneNumber,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            setTransactionId(data.transactionId);
            setMessage('Demande envoyée ! Veuillez approuver le paiement sur votre téléphone MTN MoMo.');

            // Poll for payment status
            const checkStatus = async () => {
                try {
                    const statusResponse = await fetch(
                        `/api/payments/momo/checkout?transactionId=${data.transactionId}`
                    );
                    const statusData = await statusResponse.json();

                    if (statusData.status === 'COMPLETED') {
                        setStatus('success');
                        setMessage('Paiement réussi ! Votre feature a été activée.');
                        setLoading(false);
                        return true;
                    } else if (statusData.status === 'FAILED') {
                        setStatus('error');
                        setMessage('Paiement échoué. Veuillez réessayer.');
                        setLoading(false);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Status check error:', error);
                    return false;
                }
            };

            // Check status every 3 seconds for up to 2 minutes
            let attempts = 0;
            const maxAttempts = 40;
            const interval = setInterval(async () => {
                attempts++;
                const completed = await checkStatus();

                if (completed || attempts >= maxAttempts) {
                    clearInterval(interval);
                    if (attempts >= maxAttempts && status === 'pending') {
                        setStatus('error');
                        setMessage('Délai d\'attente dépassé. Vérifiez votre transaction.');
                        setLoading(false);
                    }
                }
            }, 3000);

        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
            setLoading(false);
        }
    };

    const formatPhoneNumber = (value: string) => {
        // Remove all non-numeric characters
        const cleaned = value.replace(/\D/g, '');

        // Format as +229 XX XX XX XX
        if (cleaned.length <= 3) return `+${cleaned}`;
        if (cleaned.length <= 5) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        if (cleaned.length <= 7) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
        if (cleaned.length <= 9) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#1F6F5C]/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
                Paiement MTN Mobile Money
            </h3>

            <div className="space-y-4">
                {/* Feature Info */}
                <div className="bg-[#050505] rounded-lg p-4 border border-[#1F6F5C]/10">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">{featureName}</span>
                        <span className="text-2xl font-bold text-[#1F6F5C]">
                            {price.toLocaleString()} XOF
                        </span>
                    </div>
                </div>

                {/* Phone Number Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Numéro MTN Mobile Money
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+229 XX XX XX XX"
                        disabled={loading}
                        className="w-full bg-[#050505] border border-[#1F6F5C]/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#1F6F5C] disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Format: +229XXXXXXXX (Bénin)
                    </p>
                </div>

                {/* Status Message */}
                {message && (
                    <div
                        className={`rounded-lg p-4 ${status === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : status === 'error'
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                            }`}
                    >
                        <p className="text-sm">{message}</p>
                        {transactionId && (
                            <p className="text-xs mt-1 opacity-70">
                                Transaction: {transactionId}
                            </p>
                        )}
                    </div>
                )}

                {/* Payment Button */}
                <button
                    onClick={handlePayment}
                    disabled={loading || !phoneNumber}
                    className="w-full bg-[#1F6F5C] hover:bg-[#1F6F5C]/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>En attente...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Payer {price.toLocaleString()} XOF</span>
                        </>
                    )}
                </button>

                {/* Info */}
                <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Paiement sécurisé par MTN Mobile Money</p>
                    <p>✓ Vous recevrez une notification de confirmation</p>
                    <p>✓ La feature sera activée automatiquement</p>
                </div>
            </div>
        </div>
    );
}
