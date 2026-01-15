"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginView() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user, loading } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // router.push('/') logic is handled by the parent or useEffect in Login page
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la connexion');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <header className="login-header">
                    <img src="/logo.png" alt="Kemet" className="main-logo" />
                    <h1>MY KEMET</h1>
                    <p>Connectez-vous à votre espace personnel.</p>
                </header>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error-banner"
                    >
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="field-group">
                        <div className="input-box">
                            <Mail className="field-icon" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <div className="input-box">
                            <Lock className="field-icon" size={18} />
                            <input
                                type="password"
                                required
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <span className="spinner" /> : <>Se connecter <ArrowRight size={18} /></>}
                    </button>
                </form>

                <footer className="login-footer">
                    <a href="#">Mot de passe oublié ?</a>
                    <div className="divider" />
                    <p>Pas de compte ? <a href="/register" className="signup">S'inscrire</a></p>
                </footer>
            </div>

            <style jsx>{`
        .login-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          text-align: center;
        }

        .login-header { margin-bottom: 48px; }
        .main-logo { 
          height: 56px; 
          width: auto; 
          margin-bottom: 28px; 
          filter: drop-shadow(0 0 20px rgba(31, 111, 92, 0.3)); 
        }
        .login-header h1 { 
          font-size: 15px; 
          font-weight: 800; 
          letter-spacing: 5px; 
          color: white; 
          margin-bottom: 14px; 
        }
        .login-header p { color: #707070; font-size: 16px; }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 14px;
          color: #EF4444;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: left;
        }

        .login-form { display: flex; flex-direction: column; gap: 18px; }

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 20px;
          color: #505050;
          pointer-events: none;
          transition: color 0.3s;
        }
        .input-box input {
          width: 100%;
          background: #0F0F0F !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 16px;
          padding: 20px 24px 20px 56px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.3s;
        }
        .input-box input:focus {
          border-color: #1F6F5C !important;
          background: #121212 !important;
        }
        .input-box:has(input:focus) .field-icon {
          color: #1F6F5C;
        }

        .login-btn {
          height: 62px;
          background: white;
          color: black;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
          transition: all 0.3s;
        }
        .login-btn:hover { 
          background: #E0E0E0; 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
        }
        .login-btn:disabled { 
          opacity: 0.6; 
          cursor: not-allowed;
          transform: none;
        }

        .login-footer { margin-top: 36px; font-size: 15px; color: #606060; }
        .login-footer a { color: #606060; text-decoration: none; font-weight: 600; transition: color 0.3s; }
        .login-footer a:hover { color: #1F6F5C; }
        .divider { height: 1px; background: rgba(255, 255, 255, 0.05); margin: 28px auto; width: 60%; }
        .signup { color: white !important; margin-left: 6px; }

        .spinner {
          width: 22px; 
          height: 22px; 
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: black; 
          border-radius: 50%; 
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card { max-width: 100%; }
          .login-header { margin-bottom: 36px; }
        }
      `}</style>
        </div>
    );
}
