"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MobileHeader from "@/components/MobileHeader";
import NotificationToast from "@/components/NotificationToast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssistantView from "@/components/AssistantView";

function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Show shell only if logged in AND not on an auth-specific page
  const showShell = !loading && user && !isAuthPage;

  return (
    <div className="app-shell" style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      overflowX: 'hidden'
    }}>
      {showShell && (
        <>
          <Sidebar />
          <MobileHeader />
          <MobileNav />
        </>
      )}
      <NotificationToast />
      <main className="main-content" style={{
        width: '100%',
        padding: showShell ? undefined : '0'
      }}>
        {/* Allow /login, /register, and the root page (which will show LoginView if !user) without ProtectedRoute */}
        {isAuthPage || pathname === "/" || (!loading && !user) ? children : <ProtectedRoute>{children}</ProtectedRoute>}
      </main>

      {/* Global Assistant Chatbot - Only show if logged in and not on auth pages */}
      {showShell && <AssistantView />}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F4D3E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Unregister any previous Service Worker to avoid caching issues */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('ServiceWorker unregistered');
                }
              });
            }
          `
        }} />
      </head>
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
