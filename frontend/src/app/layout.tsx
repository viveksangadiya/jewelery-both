import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'HastKala — Handmade Jewelry & Craft Decor',
  description: 'Handcrafted jewelry, torans, wall hangings & festive decor made by artisans across India.',
};

export const viewport: Viewport = {
  themeColor: '#F5F0EB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
