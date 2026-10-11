import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Econsume',
  description:
    'Platform AI prediksi konsumsi rumah tangga + database eco-labeling produk hijau Indonesia. Kurangi pemborosan, pilih produk ramah lingkungan.',
  keywords: ['eco', 'green', 'sustainable', 'konsumsi', 'ramah lingkungan', 'Indonesia'],
  manifest: '/manifest.json',
  applicationName: 'Econsume',
  appleWebApp: { capable: true, title: 'Econsume', statusBarStyle: 'default' },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const themeInit = `(function(){try{var t=localStorage.getItem('ecoconsume_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased bg-amber-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors">
        <AppProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10">
            {children}
          </main>
          <BottomNav />
          <ServiceWorkerRegister />
        </AppProvider>
      </body>
    </html>
  );
}
