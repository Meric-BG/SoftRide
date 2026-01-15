"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isLoginPage = pathname === "/login";
  // Hide sidebar if not logged in OR if on login page
  const showSidebar = !loading && user && !isLoginPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {showSidebar && <Sidebar />}
      <main style={{
        marginLeft: showSidebar ? '260px' : '0',
        width: showSidebar ? 'calc(100% - 260px)' : '100%',
        padding: showSidebar ? '40px' : '0',
        position: 'relative',
        zIndex: 1
      }}>
        {/* AuthGuard handles redirection, but we also allow root page to show LoginView natively if !user */}
        {pathname === "/" || isLoginPage || (!loading && !user) ? children : <AuthGuard>{children}</AuthGuard>}
      </main>
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
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('K-Manager ServiceWorker registration successful');
                }, function(err) {
                  console.log('K-Manager ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html >
  );
}
