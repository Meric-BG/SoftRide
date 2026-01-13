"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, ShoppingCart, Truck, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
    const pathname = usePathname();

    const NavLinkItem = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
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
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(31, 77, 62, 0.2)' : 'transparent', // Different active color for Admin
                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: 500
                }}
            >
                {icon}
                {label}
            </Link>
        );
    };

    return (
        <nav className="glass-panel" style={{
            width: '260px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            borderRight: '1px solid var(--glass-border)',
            position: 'fixed',
            height: '100vh',
            zIndex: 20,
            background: '#0a0a0a' // Slightly darker for admin
        }}>
            <div className="brand" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px', color: 'var(--text-secondary)' }}>
                    KEMET <span style={{ color: 'white' }}>MANAGER</span>
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '16px' }}>ANALYTICS</div>
                <NavLinkItem href="/admin" icon={<LayoutDashboard size={18} />} label="Vue d'ensemble" />

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', marginTop: '16px', paddingLeft: '16px' }}>GESTION</div>
                <NavLinkItem href="/admin/updates" icon={<UploadCloud size={18} />} label="Mises à jour (FOTA)" />
                <NavLinkItem href="/admin/store" icon={<ShoppingCart size={18} />} label="Kemet Store" />
                <NavLinkItem href="/admin/fleet" icon={<Truck size={18} />} label="Flotte" />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLinkItem href="/admin/settings" icon={<Settings size={18} />} label="Paramètres" />
                <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                    <LogOut size={18} />
                    Quitter
                </Link>
            </div>
        </nav>
    );
};

export default AdminSidebar;
