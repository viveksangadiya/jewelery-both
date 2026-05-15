'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

const ANNOUNCEMENTS = [
  'Free standard shipping over: ₹9,590',
  'New Arrivals: Festival Collection — Limited Stock!',
  'Members get early access to sales — Join the Club',
];

export default function AnnouncementBar(): JSX.Element | null {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── Utility row ──────────────────────────────── */}
      <div className="utility-bar hidden sm:block">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9 text-[11px] text-brand-secondary">

          {/* Left */}
          <div className="flex items-center gap-4">
            <Link href="/store-finder" className="hover:text-brand-text transition-colors">
              Stores
            </Link>
          </div>

          {/* Center */}
          <div className="absolute left-1/2 -translate-x-1/2 font-medium text-brand-text animate-fade-in" key={current}>
            {ANNOUNCEMENTS[current]}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 relative">
            <Link href="/account" className="hover:text-brand-text transition-colors whitespace-nowrap">
              HastKala Club
            </Link>
            {mounted && (
              <>
                <span className="text-brand-border">|</span>
                {user ? (
                  <>
                    <Link href="/account" className="hover:text-brand-text transition-colors">
                      My Account
                    </Link>
                    <span className="text-brand-border">|</span>
                    <button
                      onClick={logout}
                      className="hover:text-brand-text transition-colors flex items-center gap-1"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link href="/account/login" className="hover:text-brand-text transition-colors">
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile announcement strip ─────────────────── */}
      <div className="sm:hidden bg-black text-white text-[11px] text-center py-2 px-4 font-medium animate-fade-in" key={`m-${current}`}>
        {ANNOUNCEMENTS[current]}
      </div>
    </>
  );
}
