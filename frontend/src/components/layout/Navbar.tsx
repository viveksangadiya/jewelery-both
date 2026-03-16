'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, User, Search, Menu, X, MapPin } from 'lucide-react';
import SearchPanel from '@/components/layout/SearchPanel';
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store';

// ── ORIGINAL CONTENT — unchanged ─────────────────────────
const navLinks = [
  {
    label: 'Rings',
    href: '/shop?category=rings',
    submenu: [
      { label: 'Engagement Rings', href: '/shop?category=rings&tag=engagement' },
      { label: 'Wedding Bands', href: '/shop?category=rings&tag=wedding' },
      { label: 'Statement Rings', href: '/shop?category=rings&tag=statement' },
      { label: 'Stackable Rings', href: '/shop?category=rings&tag=stackable' },
    ],
  },
  {
    label: 'Necklaces',
    href: '/shop?category=necklaces',
    submenu: [
      { label: 'Pendants', href: '/shop?category=necklaces&tag=pendant' },
      { label: 'Chains', href: '/shop?category=necklaces&tag=chain' },
      { label: 'Chokers', href: '/shop?category=necklaces&tag=choker' },
      { label: 'Layered Sets', href: '/shop?category=necklaces&tag=layered' },
    ],
  },
  {
    label: 'Earrings',
    href: '/shop?category=earrings',
    submenu: [
      { label: 'Studs', href: '/shop?category=earrings&tag=studs' },
      { label: 'Hoops', href: '/shop?category=earrings&tag=hoops' },
      { label: 'Drop & Dangle', href: '/shop?category=earrings&tag=drop' },
      { label: 'Chandeliers', href: '/shop?category=earrings&tag=chandelier' },
    ],
  },
  {
    label: 'Bracelets',
    href: '/shop?category=bracelets',
    submenu: [
      { label: 'Tennis Bracelets', href: '/shop?category=bracelets&tag=tennis' },
      { label: 'Bangles', href: '/shop?category=bracelets&tag=bangles' },
      { label: 'Charm Bracelets', href: '/shop?category=bracelets&tag=charm' },
    ],
  },
  { label: 'Sets', href: '/shop?category=sets' },
  { label: 'Sale', href: '/shop?sale=true', highlight: true },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const leaveTimer = useRef(null);

  const cartCount = useCartStore(s => s.getCount());
  const openCart = useCartStore(s => s.openCart);
  const user = useAuthStore(s => s.user);
  const wishlistCount = useWishlistStore(s => s.getCount());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMenuEnter = (label) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveMenu(label);
  };
  const handleMenuLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };
  const handleMenuKeep = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  return (
    <>
      {/* ── Mobile Drawer ─────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-display text-xl font-bold tracking-tight text-charcoal">
                Lumière<span className="text-yellow-600">✦</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-5 py-3.5 text-sm font-semibold tracking-wide border-b border-gray-50 transition-colors ${
                      link.highlight ? 'text-red-600' : 'text-gray-800 hover:text-yellow-700 hover:bg-yellow-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.submenu && (
                    <div className="bg-gray-50">
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-2.5 text-sm text-gray-500 hover:text-yellow-700 transition-colors border-b border-gray-100 last:border-0"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom: Sign in if not logged in */}
            {mounted && !user && (
              <div className="p-4 border-t border-gray-100">
                <Link
                  href="/account/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center btn-gold py-3 rounded-xl font-semibold text-sm"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Header ───────────────────────────────── */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>

        {/* ── ROW 1: Pincode | Logo | Icons (Kisna layout) ── */}
        <div className="border-b border-gray-100">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-[68px]">

            {/* Left: Pincode (desktop) / Hamburger (mobile) */}
            <div className="w-1/3 flex items-center">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} className="text-gray-700" />
              </button>
              {/* Desktop pincode — like Kisna top-left */}
              <button className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium tracking-wide uppercase">
                <MapPin size={13} />
                Enter Pincode
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/">
                <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-charcoal whitespace-nowrap">
                  Lumière<span className="text-yellow-600">✦</span>
                </span>
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="w-1/3 flex items-center justify-end gap-0.5">
              <button onClick={() => setSearchOpen(true)} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Search size={20} className="text-gray-700" />
              </button>

              <Link href="/account" className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart size={20} className="text-gray-700" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={mounted && user ? '/account' : '/account/login'}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} className="text-gray-700" />
              </Link>

              <button onClick={openCart} className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingBag size={20} className="text-gray-700" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-yellow-600 text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Nav links bar (Kisna style) ── */}
        <div className="hidden lg:block border-b border-gray-100 relative" onMouseLeave={handleMenuLeave}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => link.submenu ? handleMenuEnter(link.label) : setActiveMenu(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 xl:px-5 py-3.5 text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap border-b-2 -mb-px ${
                      activeMenu === link.label
                        ? 'border-gray-900 text-gray-900'
                        : link.highlight
                          ? 'border-transparent text-red-600 hover:text-red-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* ── Full-width dropdown (Kisna style) ── */}
          {activeMenu && (
            <div
              onMouseEnter={handleMenuKeep}
              onMouseLeave={handleMenuLeave}
              className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50"
            >
              <div className="max-w-screen-xl mx-auto px-10 py-8">
                {(() => {
                  const active = navLinks.find(l => l.label === activeMenu);
                  if (!active?.submenu) return null;
                  return (
                    <div className="flex items-start gap-16">
                      {/* Submenu links in a column */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
                          {active.label}
                        </p>
                        <div className="space-y-3">
                          {active.submenu.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setActiveMenu(null)}
                              className="block text-sm text-gray-600 hover:text-yellow-700 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-6">
                          <Link
                            href={active.href}
                            onClick={() => setActiveMenu(null)}
                            className="inline-flex items-center border border-gray-300 hover:border-gray-900 text-xs font-medium text-gray-700 hover:text-gray-900 px-5 py-2 rounded transition-colors"
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </header>
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
