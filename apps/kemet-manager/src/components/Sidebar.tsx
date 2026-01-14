"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UploadCloud,
    ShoppingBag,
    Truck,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

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
                <NavLink href="/fleet" icon={<Truck size={18} />} label="Flotte" />
                <NavLink href="/requests" icon={<LayoutDashboard size={18} />} label="Requêtes" />
            </nav>

            <div style={{ paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <NavLink href="/settings" icon={<Settings size={18} />} label="Paramètres" />
                <div style={{ height: '8px' }}></div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}>
                    <LogOut size={18} />
                    Déconnexion
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
