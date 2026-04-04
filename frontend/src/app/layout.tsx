'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <title>Lumière — Fine Jewelry for Real Life</title>
        <meta name="description" content="Gold-plated. Tarnish-resistant. Made for stacking, layering, and everyday wear." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {!isAdmin && <AnnouncementBar />}
        {!isAdmin && <Navbar />}
        <main>{children}</main>
        {!isAdmin && <Footer />}
        {!isAdmin && <CartDrawer />}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, system-ui, sans-serif',
              background: '#111',
              color: '#fff',
              borderRadius: '999px',
              padding: '12px 20px',
              fontSize: '13px',
            },
            iconTheme: { primary: '#FF4D4D', secondary: '#fff' },
          }}
        />
      </body>
    </html>
  );
}
