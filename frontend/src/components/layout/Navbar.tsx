'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import SearchPanel from '@/components/layout/SearchPanel';
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store';

const navLinks = [
  {
    label: 'Door Torans',
    href: '/shop?category=door-torans',
    submenu: [
      { label: 'Traditional Torans',  href: '/shop?category=door-torans&tag=traditional' },
      { label: 'Fabric & Thread',     href: '/shop?category=door-torans&tag=fabric' },
      { label: 'Beaded Torans',       href: '/shop?category=door-torans&tag=beaded' },
      { label: 'Mirror Work Torans',  href: '/shop?category=door-torans&tag=mirror' },
      { label: 'Tassel Torans',       href: '/shop?category=door-torans&tag=tassel' },
    ],
  },
  {
    label: 'Festival',
    href: '/shop?category=festival',
    submenu: [
      { label: 'Diwali Special',  href: '/shop?category=festival&tag=diwali' },
      { label: 'Navratri',        href: '/shop?category=festival&tag=navratri' },
      { label: 'Puja Decor',      href: '/shop?category=festival&tag=puja' },
      { label: 'Holi Collection', href: '/shop?category=festival&tag=holi' },
    ],
  },
  {
    label: 'Wedding',
    href: '/shop?category=wedding',
    submenu: [
      { label: 'Bridal Entrance Torans', href: '/shop?category=wedding&tag=bridal' },
      { label: 'Marigold Torans',        href: '/shop?category=wedding&tag=marigold' },
      { label: 'Floral Decorations',     href: '/shop?category=wedding&tag=floral' },
      { label: 'Premium Sets',           href: '/shop?category=wedding&tag=premium' },
    ],
  },
  {
    label: 'Wall Hangings',
    href: '/shop?category=wall-hangings',
    submenu: [
      { label: 'Macrame Hangings',   href: '/shop?category=wall-hangings&tag=macrame' },
      { label: 'Boho Dreamcatchers', href: '/shop?category=wall-hangings&tag=boho' },
      { label: 'Woven Art',          href: '/shop?category=wall-hangings&tag=woven' },
    ],
  },
  { label: 'Gift Sets', href: '/shop?category=gift-sets' },
  { label: 'Sale',      href: '/shop?sale=true', highlight: true },
];

export default function Navbar() {
  const [mounted, setMounted]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const cartCount     = useCartStore(s => s.getCount());
  const openCart      = useCartStore(s => s.openCart);
  const user          = useAuthStore(s => s.user);
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

  const handleMenuEnter = (label: string) => {
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
          <div className="absolute left-0 top-0 bottom-0 w-[290px] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <span className="text-xl font-bold tracking-tight text-[#1c1c1c]">HastKala</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-[#f5f5f5] rounded transition-colors">
                <X size={20} className="text-[#1c1c1c]" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-5 py-3.5 text-sm font-medium border-b border-[#f5f5f5] transition-colors ${
                      link.highlight ? 'text-red-600' : 'text-[#1c1c1c] hover:text-[#6b6b6b]'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.submenu && (
                    <div className="bg-[#f5f5f5]">
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-2.5 text-sm text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors border-b border-[#e8e8e8] last:border-0"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {mounted && !user && (
              <div className="p-4 border-t border-[#e8e8e8]">
                <Link
                  href="/account/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-[#1c1c1c] text-white py-3 font-semibold text-sm tracking-wide"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Header ───────────────────────────────── */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}
        style={{ borderBottom: '1px solid #e8e8e8' }}>

        {/* ── ROW 1: Logo center, Icons right ── */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-[64px]">

          {/* Left */}
          <div className="w-1/3 flex items-center">
            <button className="lg:hidden p-2 -ml-1 hover:bg-[#f5f5f5] rounded transition-colors" onClick={() => setMobileOpen(true)}>
              <Menu size={22} className="text-[#1c1c1c]" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1c] whitespace-nowrap">
                HastKala
              </span>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="w-1/3 flex items-center justify-end gap-0.5">
            <button onClick={() => setSearchOpen(true)} className="p-2.5 hover:bg-[#f5f5f5] rounded transition-colors">
              <Search size={20} className="text-[#1c1c1c]" />
            </button>

            <Link href="/account" className="relative p-2.5 hover:bg-[#f5f5f5] rounded transition-colors">
              <Heart size={20} className="text-[#1c1c1c]" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#1c1c1c] text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link href={mounted && user ? '/account' : '/account/login'} className="p-2.5 hover:bg-[#f5f5f5] rounded transition-colors">
              <User size={20} className="text-[#1c1c1c]" />
            </Link>

            <button onClick={openCart} className="relative p-2.5 hover:bg-[#f5f5f5] rounded transition-colors">
              <ShoppingBag size={20} className="text-[#1c1c1c]" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#1c1c1c] text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── ROW 2: Nav links ── */}
        <div className="hidden lg:block border-t relative" style={{ borderColor: '#e8e8e8' }} onMouseLeave={handleMenuLeave}>
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
                    className={`flex items-center px-4 xl:px-5 py-3 text-xs font-medium tracking-widest uppercase transition-all whitespace-nowrap border-b-2 -mb-px ${
                      activeMenu === link.label
                        ? 'border-[#1c1c1c] text-[#1c1c1c]'
                        : link.highlight
                          ? 'border-transparent text-red-600 hover:text-red-700'
                          : 'border-transparent text-[#6b6b6b] hover:text-[#1c1c1c]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* ── Full-width dropdown ── */}
          {activeMenu && (
            <div
              onMouseEnter={handleMenuKeep}
              onMouseLeave={handleMenuLeave}
              className="absolute top-full left-0 right-0 bg-white border-t shadow-md z-50"
              style={{ borderColor: '#e8e8e8' }}
            >
              <div className="max-w-screen-xl mx-auto px-10 py-8">
                {(() => {
                  const active = navLinks.find(l => l.label === activeMenu);
                  if (!active?.submenu) return null;
                  return (
                    <div className="flex items-start gap-16">
                      <div>
                        <p className="text-[10px] font-bold text-[#9b9b9b] uppercase tracking-widest mb-5">
                          {active.label}
                        </p>
                        <div className="space-y-3">
                          {active.submenu.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setActiveMenu(null)}
                              className="block text-sm text-[#4a4a4a] hover:text-[#1c1c1c] transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-6">
                          <Link
                            href={active.href}
                            onClick={() => setActiveMenu(null)}
                            className="inline-flex items-center border border-[#e8e8e8] hover:border-[#1c1c1c] text-xs font-medium text-[#4a4a4a] hover:text-[#1c1c1c] px-5 py-2 transition-colors"
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
