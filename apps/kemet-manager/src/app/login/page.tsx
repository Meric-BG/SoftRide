"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // La redirection est gérée par le useEffect qui surveille l'état user
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Partie Gauche : Identité Dashboard */}
        <div className="brand-panel">
          <div className="brand-header">
            <img src="/logo.png" alt="Logo Kemet" className="kemet-logo" />
            <span className="brand-title-text">
              KEMET <span className="accent">MANAGER</span>
            </span>
          </div>

          <div className="brand-body">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="brand-hero"
            >
              <h1>Plateforme de Supervision Automobile</h1>
              <p>Gérez vos actifs, diagnostiquez les systèmes et déployez les mises à jour en toute sécurité.</p>
            </motion.div>
          </div>

          <div className="brand-footer">
            <div className="security-badge">
              <ShieldCheck size={14} />
              <span>Accès sécurisé (E2EE)</span>
            </div>
            <p className="copyright">© 2026 Kemet Mobility Labs</p>
          </div>
        </div>

        {/* Partie Droite : Formulaire */}
        <div className="form-panel">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-container"
          >
            <div className="form-head">
              <h2>Connexion</h2>
              <p>Saisissez vos identifiants administrateur.</p>
            </div>

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

            <form onSubmit={handleLogin}>
              <div className="input-field-group">
                <label>VOTRE EMAIL</label>
                <div className="input-with-icon">
                  <Mail className="inner-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="admin@kemet-mobility.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>MOT DE PASSE</label>
                <div className="input-with-icon">
                  <Lock className="inner-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <label className="remember">
                  <input type="checkbox" />
                  <span>Rester connecté</span>
                </label>
                <a href="#" className="forgot">Mot de passe oublié ?</a>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? (
                  <div className="loader" />
                ) : (
                  <>
                    Accéder au Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          width: 100vw;
          height: 100vh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .login-container {
          width: 100%;
          height: 100%;
          display: flex;
        }

        /* Panneau de Gauche */
        .brand-panel {
          flex: 0 0 420px;
          background: linear-gradient(135deg, #0a0a0a 0%, #050505 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 48px;
          position: relative;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .kemet-logo { height: 32px; width: auto; }
        .brand-title-text { 
          font-size: 20px; 
          font-weight: 800; 
          color: white; 
          letter-spacing: -0.5px;
        }
        .brand-title-text .accent { color: #1F6F5C; }

        .brand-body { margin: auto 0; }
        .brand-hero h1 { 
          font-size: 36px; 
          font-weight: 800; 
          color: white; 
          line-height: 1.2; 
          margin-bottom: 24px; 
        }
        .brand-hero p { 
          color: #707070; 
          font-size: 16px; 
          line-height: 1.6; 
        }

        .brand-footer { margin-top: auto; }
        .security-badge { 
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
          padding: 10px 14px; 
          background: rgba(31, 111, 92, 0.1); 
          border-radius: 10px; 
          color: #1F6F5C; 
          font-size: 13px; 
          font-weight: 700;
          margin-bottom: 24px;
        }
        .copyright { font-size: 13px; color: #404040; }

        /* Panneau de Droite */
        .form-panel {
          flex: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .form-container {
          width: 100%;
          max-width: 440px;
        }

        .form-head { margin-bottom: 40px; }
        .form-head h2 { 
          font-size: 40px; 
          font-weight: 800; 
          color: white; 
          margin-bottom: 10px; 
        }
        .form-head p { color: #A0A0A0; font-size: 16px; }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #EF4444;
          font-size: 14px;
          margin-bottom: 24px;
        }

        form { display: flex; flex-direction: column; gap: 24px; }

        .input-field-group label { 
          display: block; 
          font-size: 11px; 
          font-weight: 800; 
          color: #1F6F5C; 
          letter-spacing: 1.5px; 
          margin-bottom: 12px; 
          cursor: default;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .inner-icon {
          position: absolute;
          left: 20px;
          color: #505050;
          pointer-events: none;
        }
        .input-with-icon input {
          width: 100%;
          background: #0F0F0F !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 14px;
          padding: 18px 20px 18px 56px;
          color: white;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }
        .input-with-icon input:focus {
          border-color: #1F6F5C !important;
          background: #121212 !important;
        }
        .input-with-icon input:focus + .inner-icon {
          color: #1F6F5C;
        }

        .form-actions { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          font-size: 14px; 
        }
        .remember { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          color: #707070; 
          cursor: pointer; 
        }
        .forgot { 
          color: #1F6F5C; 
          text-decoration: none; 
          font-weight: 600; 
        }
        .forgot:hover { text-decoration: underline; }

        .login-button {
          height: 58px;
          background: #1F6F5C;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 8px;
          transition: all 0.3s;
        }
        .login-button:hover { 
          transform: translateY(-2px); 
          background: #268C74; 
          box-shadow: 0 8px 24px rgba(31, 111, 92, 0.3);
        }
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loader {
          width: 22px; 
          height: 22px; 
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: white; 
          border-radius: 50%; 
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .brand-panel { display: none; }
          .form-panel { padding: 24px; }
        }
      `}</style>
    </div>
  );
}
