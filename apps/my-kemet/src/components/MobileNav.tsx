"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, ShoppingBag, Settings, User, CreditCard, Headphones } from 'lucide-react';

const MobileNav = () => {
    const pathname = usePathname();

    const NavIcon = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    flex: 1
                }}
            >
                {icon}
                <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </Link>
        );
    };

    return (
        <div className="mobile-nav glass-panel" style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            height: '70px',
            padding: '10px 0',
            display: 'none', // Controlled by globals.css media queries
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            borderTop: '1px solid var(--glass-border)',
            borderRadius: '20px 20px 0 0'
        }}>
            <NavIcon href="/" icon={<Home size={20} />} label="Accueil" />
            <NavIcon href="/my-features" icon={<Zap size={20} />} label="Features" />
            <NavIcon href="/store" icon={<ShoppingBag size={20} />} label="Store" />
            <NavIcon href="/profile" icon={<User size={20} />} label="Profil" />
            <NavIcon href="/settings" icon={<Settings size={20} />} label="Réglages" />
        </div>
    );
};

export default MobileNav;
