"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Car, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [vim, setVim] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Check if VIM exists and is not sold
            const { data: vehicle, error: vError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('vim', vim)
                .single();

            if (vError || !vehicle) {
                throw new Error("Ce VIM n'existe pas dans notre base de données.");
            }

            if (vehicle.is_sold) {
                throw new Error("Ce véhicule est déjà associé à un autre compte.");
            }

            // 2. Register user with name metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 3. Link VIM to vehicle
                const { error: updateError } = await supabase
                    .from('vehicles')
                    .update({ is_sold: true, owner_id: authData.user.id })
                    .eq('vim', vim);

                if (updateError) throw updateError;

                // 4. Update the profile (created by trigger) with the VIM
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ vim_linked: vim })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;

                router.push('/login');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="background-visual">
                <div className="glow-c1" />
                <div className="glow-c2" />
            </div>

            <div className="login-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-content"
                >
                    <div className="brand-logo">
                        <img src="/logo.png" alt="Kemet" />
                        <span className="brand-name">MY KEMET</span>
                    </div>

                    <div className="header-text">
                        <h1>Créez votre <span>espace.</span></h1>
                        <p>Enregistrez votre véhicule Kemet pour commencer.</p>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <form onSubmit={handleRegister} className="login-form">
                        <div className="input-field">
                            <User className="icon" size={20} />
                            <input
                                type="text"
                                required
                                placeholder="Nom complet"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="input-field">
                            <Car className="icon" size={20} />
                            <input
                                type="text"
                                required
                                placeholder="Votre VIM (ex: KMT-FALCON-XXX)"
                                value={vim}
                                onChange={(e) => setVim(e.target.value)}
                            />
                        </div>

                        <div className="input-field">
                            <Mail className="icon" size={20} />
                            <input
                                type="email"
                                required
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="input-field">
                            <Lock className="icon" size={20} />
                            <input
                                type="password"
                                required
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? (
                                <div className="loader" />
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="signup-prompt">
                        <p>Déjà un compte ? <a href="/login">Se connecter</a></p>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
        .login-wrapper {
          width: 100vw;
          height: 100vh;
          background: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .background-visual { position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 1; }
        .glow-c1 {
          position: absolute; top: -10%; right: -10%; width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(31, 111, 92, 0.1) 0%, transparent 70%);
          filter: blur(100px);
        }
        .glow-c2 {
          position: absolute; bottom: -10%; left: -10%; width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(31, 111, 92, 0.05) 0%, transparent 70%);
          filter: blur(120px);
        }

        .login-container { position: relative; z-index: 10; width: 100%; max-width: 480px; padding: 40px; }

        .login-content {
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          padding: 60px 48px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          text-align: center;
        }

        .brand-logo { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 32px; }
        .brand-logo img { height: 32px; width: auto; }
        .brand-name { font-size: 14px; font-weight: 800; letter-spacing: 4px; color: white; opacity: 0.8; }

        .header-text h1 { font-size: 32px; font-weight: 800; color: white; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1.5px; }
        .header-text h1 span { color: #1F6F5C; }
        .header-text p { color: #787878; font-size: 15px; margin-bottom: 40px; }

        .error-box { background: rgba(239, 68, 68, 0.1); color: #EF4444; padding: 12px; border-radius: 12px; margin-bottom: 24px; font-size: 14px; }

        .login-form { display: flex; flex-direction: column; gap: 16px; }

        .input-field {
          position: relative; display: flex; align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 0 24px;
          height: 60px;
          transition: all 0.4s;
        }
        .input-field:focus-within { border-color: #1F6F5C; background: rgba(255, 255, 255, 0.05); }
        .icon { color: #404040; margin-right: 16px; }
        .input-field:focus-within .icon { color: #1F6F5C; }

        .input-field input { flex: 1; background: transparent; border: none; outline: none; color: white; font-size: 15px; }
        
        .login-button {
          height: 60px; background: #FFF; color: #000; border: none; border-radius: 18px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.3s; margin-top: 12px;
        }
        .login-button:hover { background: #E0E0E0; transform: translateY(-2px); }
        .login-button:disabled { opacity: 0.6; }

        .signup-prompt { margin-top: 32px; font-size: 14px; color: #505050; }
        .signup-prompt a { color: #FFF; text-decoration: none; font-weight: 700; }

        .loader {
          width: 20px; height: 20px; border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
