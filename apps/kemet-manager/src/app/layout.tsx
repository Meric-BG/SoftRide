"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
              {!isLoginPage && <Sidebar />}
              <main style={{
                marginLeft: isLoginPage ? '0' : '260px',
                width: isLoginPage ? '100%' : 'calc(100% - 260px)',
                padding: isLoginPage ? '0' : '40px',
                position: 'relative',
                zIndex: 1
              }}>
                {children}
              </main>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html >
  );
}
