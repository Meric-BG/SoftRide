"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        console.log('Login successful, redirecting...');
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Identifiants invalides');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="card-header">
          <h1>KEMET MANAGER</h1>
          <p>Plateforme de supervision automobile</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="error-message"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>ADMIN EMAIL</label>
            <div className="input-box">
              <Mail className="icon" size={18} />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>MOT DE PASSE</label>
            <div className="input-box">
              <Lock className="icon" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="submit-btn"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                Se connecter
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="card-footer">
          <p>© 2026 Kemet Mobility Labs</p>
        </div>
      </motion.div>

      <style jsx>{`
                .login-page {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #020202;
                    position: relative;
                    padding: 24px;
                    overflow: hidden;
                }

                .bg-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top right, rgba(31, 111, 92, 0.15) 0%, transparent 40%),
                                radial-gradient(circle at bottom left, rgba(31, 111, 92, 0.05) 0%, transparent 30%);
                    z-index: 1;
                    pointer-events: none;
                }

                .login-card {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 420px;
                    background: rgba(10, 10, 10, 0.7);
                    backdrop-filter: blur(35px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 32px;
                    padding: 48px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.85);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 48px;
                }

        .card-header h1 {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 5px;
          color: white;
          margin-bottom: 12px;
        }

        .card-header p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.5);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #EF4444;
          font-size: 14px;
          margin-bottom: 24px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #1F6F5C;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .icon {
          position: absolute;
          left: 18px;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.3s;
          pointer-events: none;
          z-index: 1;
        }

        .input-box input {
          width: 100%;
          height: 54px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          padding: 0 20px 0 52px;
          color: white;
          font-size: 15px;
          outline: none;
          position: relative;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-box input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-box input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: #1F6F5C;
          box-shadow: 0 0 0 4px rgba(31, 111, 92, 0.1);
        }

        .input-box input:focus + .icon {
          color: #1F6F5C;
          transform: scale(1.1);
        }

        .submit-btn {
          height: 54px;
          background: #1F6F5C;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          transition: all 0.3s;
        }

        .submit-btn:hover {
          background: #268C74;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(31, 111, 92, 0.2);
        }

        .card-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.2);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
