"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== "/login") {
            router.push("/login"); // Redirection vers login si non connecté
        }
    }, [user, loading, router, pathname]);

    // Afficher un loader ou rien pendant la vérification, sauf si on est sur la page de login
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: 'var(--accent-primary)'
            }}>
                Chargement...
            </div>
        );
    }

    // Si pas connecté et pas sur login, on affiche un écran de redirection
    if (!user && pathname !== "/login") {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: 'var(--text-secondary)'
            }}>
                Redirection vers la connexion...
            </div>
        );
    }

    return <>{children}</>;
}
