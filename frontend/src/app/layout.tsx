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
        <meta name="theme-color" content="#ffffff" />
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
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              color: '#1c1c1c',
              border: '1px solid #e1e1e1',
              borderRadius: '0px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#347a07', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#e32c2b', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  );
}
