"use client";

import React from 'react';
import Link from 'next/link';

const MobileHeader = () => {
    return (
        <header className="mobile-header glass-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            padding: '0 20px',
            display: 'none', // Managed by globals.css
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-1px' }}>
                    MY <span style={{ color: 'var(--accent-primary)' }}>KEMET</span>
                </h2>
            </Link>
        </header>
    );
};

export default MobileHeader;
