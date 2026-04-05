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
  const isAdmin  = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <title>HastKala — Handmade Torans &amp; Craft Decor</title>
        <meta name="description" content="Handcrafted torans, wall hangings & festive decor made by artisans across India. Shop traditional, wedding & festival collections." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FAF9EE" />
      </head>
      <body style={{ backgroundColor: '#FAF9EE', color: '#642308' }}>
        {!isAdmin && <AnnouncementBar />}
        {!isAdmin && <Navbar />}
        <main>{children}</main>
        {!isAdmin && <Footer />}
        {!isAdmin && <CartDrawer />}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              backgroundColor: '#FAF9EE',
              color: '#642308',
              border: '1px solid #EBEBCA',
              borderRadius: '2px',
              boxShadow: '0 4px 16px rgba(100,35,8,0.08)',
            },
            success: { iconTheme: { primary: '#903E1D', secondary: '#FAF9EE' } },
            error:   { iconTheme: { primary: '#b91c1c', secondary: '#FAF9EE' } },
          }}
        />
      </body>
    </html>
  );
}
