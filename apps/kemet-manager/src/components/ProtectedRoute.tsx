"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: '#1F6F5C',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
