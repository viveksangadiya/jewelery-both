'use client';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith('/admin');

  return (
    <>
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
            color: '#000000',
            border: '1px solid #E0D9D0',
            borderRadius: '0px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#347a07', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#000000', secondary: '#ffffff' } },
        }}
      />
    </>
  );
}
