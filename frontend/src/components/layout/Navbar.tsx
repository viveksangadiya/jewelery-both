'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Search, Menu } from 'lucide-react';
import MegaMenu from '@/components/layout/MegaMenu';
import SearchPanel from '@/components/layout/SearchPanel';
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store';

export default function Navbar() {
  const [mounted, setMounted]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  const cartCount     = useCartStore(s => s.getCount());
  const openCart      = useCartStore(s => s.openCart);
  const wishlistCount = useWishlistStore(s => s.getCount());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ── Main Header ───────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}
        style={{ borderBottom: '1px solid #E0D9D0' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-[60px] sm:h-[68px]">

          {/* ── Left: Menu button ── */}
          <div className="w-1/3 flex items-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 p-1.5 -ml-1.5 hover:bg-brand-hover transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={20} className="text-brand-text" />
              <span className="hidden sm:block text-sm font-medium tracking-wide text-brand-text">
                Menu
              </span>
            </button>
          </div>

          {/* ── Center: Logo ── */}
          <div className="flex-1 flex justify-center">
            <Link href="/" aria-label="HastKala Home">
              <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.12em] text-brand-text uppercase whitespace-nowrap select-none">
                HastKala
              </span>
            </Link>
          </div>

          {/* ── Right: Icons ── */}
          <div className="w-1/3 flex items-center justify-end gap-0.5 sm:gap-1">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 hover:bg-brand-hover transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-brand-text" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2.5 hover:bg-brand-hover transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-brand-text" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-text text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart / Bag */}
            <button
              onClick={openCart}
              className="relative p-2.5 hover:bg-brand-hover transition-colors"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} className="text-brand-text" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-text text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mega Menu Overlay ─────────────────────────── */}
      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Search Panel ──────────────────────────────── */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
