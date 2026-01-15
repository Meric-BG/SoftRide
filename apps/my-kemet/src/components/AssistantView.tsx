"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Mic, MicOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AssistantView() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: 'Bonjour ! Je suis votre assistant Kemet. Comment puis-je vous aider aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            // Get Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Not authenticated');
            }

            // Call Supabase Edge Function
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: text })
                }
            );

            const data = await response.json();

            const assistMsg = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, assistMsg]);
            speak(data.response);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = {
                role: 'assistant',
                content: 'Désolé, je ne peux pas répondre pour le moment. Veuillez créer un ticket support pour une assistance personnalisée.'
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const toggleListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
        };
        recognition.start();
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '32px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(31, 111, 92, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
                {isSpeaking && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: '12px',
                            height: '12px',
                            background: '#10B981',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }}
                    />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            bottom: '180px',
                            right: '32px',
                            width: '380px',
                            height: '520px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1000,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} color="white" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Assistant Kemet</h3>
                                <p style={{ fontSize: '12px', color: '#10B981' }}>En ligne • Français</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Bot size={14} color="var(--accent-primary)" />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleListening}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: isListening ? '#EF4444' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </motion.button>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                                        placeholder="Posez votre question..."
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            padding: '12px 48px 12px 16px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleSend(input)}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-primary)',
                                            cursor: 'pointer',
                                            display: 'flex'
                                        }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
