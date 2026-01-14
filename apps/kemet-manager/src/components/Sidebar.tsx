"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    UploadCloud,
    ShoppingBag,
    Settings,
    LogOut,
    Terminal,
    Wrench
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const NavLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(31, 111, 92, 0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500
                }}
            >
                {icon}
                {label}
            </Link>
        );
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--glass-border)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        }}>
            <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    KEMET <span style={{ color: 'var(--accent-primary)' }}>MANAGER</span>
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '16px' }}>
                    Analytics
                </div>
                <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Vue d'ensemble" />

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', marginTop: '24px', paddingLeft: '16px' }}>
                    Gestion
                </div>
                <NavLink href="/updates" icon={<UploadCloud size={18} />} label="Mises à jour" />
                <NavLink href="/store" icon={<ShoppingBag size={18} />} label="Kemet Store" />
                <NavLink href="/testing-sda" icon={<Terminal size={18} />} label="Testing SDA" />
                <NavLink href="/maintenance" icon={<Wrench size={18} />} label="Maintenance" />
            </nav>

            <div style={{ paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <LogOut size={18} />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

