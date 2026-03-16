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
        <title>Lumière Jewels – Fine Jewelry Store</title>
        <meta name="description" content="Discover exquisite jewelry crafted for every occasion." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {!isAdmin && <AnnouncementBar />}
        {!isAdmin && <Navbar />}
        <main>{children}</main>
        {!isAdmin && <Footer />}
        {!isAdmin && <CartDrawer />}
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      </body>
    </html>
  );
}
