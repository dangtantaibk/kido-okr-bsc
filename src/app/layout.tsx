import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { MainContent } from '@/components/layout/main-content';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { OrganizationProvider } from '@/contexts/organization-context';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KIDO Group - Strategic Balanced Scorecard',
  description: 'Hệ thống quản lý chiến lược BSC cho Tập đoàn KIDO',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider>
          <AuthProvider>
            <OrganizationProvider>
              <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <MainContent>
                  <AuthGuard>{children}</AuthGuard>
                </MainContent>
              </div>
            </OrganizationProvider>
          </AuthProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
