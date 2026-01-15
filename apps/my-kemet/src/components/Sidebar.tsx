"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, ShoppingBag, Settings, User, CreditCard, Headphones } from 'lucide-react';
// We can import CSS modules if we had them, or rely on globals.css utilities
// Since we used globals, we'll use inline styles + global classes

const Sidebar = () => {
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
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
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
        <nav className="sidebar-desktop glass-panel" style={{
            width: '240px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            borderRight: '1px solid var(--glass-border)',
            position: 'fixed',
            height: '100vh',
            zIndex: 10
        }}>
            <div className="brand" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-1px' }}>
                    MY <span style={{ color: 'var(--accent-primary)' }}>KEMET</span>
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLinkItem href="/" icon={<Home size={20} />} label="Tableau de bord" />
                <NavLinkItem href="/store" icon={<ShoppingBag size={20} />} label="Kemet Store" />
                <NavLinkItem href="/my-features" icon={<Zap size={20} />} label="Mes fonctionnalités" />
                <NavLinkItem href="/billing" icon={<CreditCard size={20} />} label="Facturation" />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLinkItem href="/profile" icon={<User size={20} />} label="Profil" />
                <NavLinkItem href="/requests" icon={<Headphones size={20} />} label="Support" />
                <NavLinkItem href="/settings" icon={<Settings size={20} />} label="Réglages" />
            </div>
        </nav>
    );
};

export default Sidebar;
