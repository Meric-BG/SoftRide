import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Google Font instead of missing local files
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kemet Manager",
  description: "Admin Console for Kemet Vehicles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
          <Sidebar />
          <main style={{ marginLeft: '260px', width: 'calc(100% - 260px)', padding: '40px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
