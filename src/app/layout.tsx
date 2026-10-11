import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'EcoConsume AI — Belanja Lebih Cerdas, Hidup Lebih Hijau',
  description:
    'Platform AI prediksi konsumsi rumah tangga + database eco-labeling produk hijau Indonesia. Kurangi pemborosan, pilih produk ramah lingkungan.',
  keywords: ['eco', 'green', 'sustainable', 'konsumsi', 'ramah lingkungan', 'Indonesia'],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased bg-amber-50 dark:bg-gray-950 min-h-screen transition-colors">
        <AppProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
