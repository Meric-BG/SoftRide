"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MobileHeader from "@/components/MobileHeader";
import NotificationToast from "@/components/NotificationToast";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <AuthProvider>
          <div className="app-shell" style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            overflowX: 'hidden'
          }}>
            {!isAuthPage && (
              <>
                <Sidebar />
                <MobileHeader />
                <MobileNav />
              </>
            )}
            <NotificationToast />
            <main className="main-content" style={{
              width: '100%',
              padding: isAuthPage ? '0' : undefined
            }}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
