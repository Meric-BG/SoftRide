"use client";

import React, { useEffect, useState } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token && !isAuthPage) {
        router.push('/auth/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <html lang="fr">
        <body style={{ background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="loader"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body>
        <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
          {!isAuthPage && <Sidebar />}
          <main style={{ marginLeft: isAuthPage ? '0' : '240px', flex: 1, padding: isAuthPage ? '0' : '32px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
