'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import SearchPanel from '@/components/layout/SearchPanel';
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store';

const NAV = [
  {
    label: 'Rings', href: '/shop?category=rings',
    sub: [
      { label: 'Engagement Rings', href: '/shop?category=rings&tag=engagement' },
      { label: 'Wedding Bands',    href: '/shop?category=rings&tag=wedding' },
      { label: 'Statement Rings',  href: '/shop?category=rings&tag=statement' },
      { label: 'Stackable Rings',  href: '/shop?category=rings&tag=stackable' },
    ],
  },
  {
    label: 'Necklaces', href: '/shop?category=necklaces',
    sub: [
      { label: 'Pendants',     href: '/shop?category=necklaces&tag=pendant' },
      { label: 'Chains',       href: '/shop?category=necklaces&tag=chain' },
      { label: 'Chokers',      href: '/shop?category=necklaces&tag=choker' },
      { label: 'Layered Sets', href: '/shop?category=necklaces&tag=layered' },
    ],
  },
  {
    label: 'Earrings', href: '/shop?category=earrings',
    sub: [
      { label: 'Studs',        href: '/shop?category=earrings&tag=studs' },
      { label: 'Hoops',        href: '/shop?category=earrings&tag=hoops' },
      { label: 'Drop & Dangle', href: '/shop?category=earrings&tag=drop' },
      { label: 'Jhumkas',      href: '/shop?category=earrings&tag=jhumka' },
    ],
  },
  {
    label: 'Bracelets', href: '/shop?category=bracelets',
    sub: [
      { label: 'Tennis',    href: '/shop?category=bracelets&tag=tennis' },
      { label: 'Bangles',   href: '/shop?category=bracelets&tag=bangles' },
      { label: 'Charms',    href: '/shop?category=bracelets&tag=charm' },
    ],
  },
  { label: 'Sets', href: '/shop?category=sets', sub: [] },
  { label: 'Sale 🔥', href: '/shop?sale=true', sub: [], sale: true },
];

export default function Navbar() {
  const [mounted, setMounted]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const leaveTimer = useRef<any>(null);

  const cartCount     = useCartStore(s => s.getCount());
  const openCart      = useCartStore(s => s.openCart);
  const user          = useAuthStore(s => s.user);
  const wishlistCount = useWishlistStore(s => s.getCount());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const enter = (label: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveMenu(label);
  };
  const leave = () => { leaveTimer.current = setTimeout(() => setActiveMenu(null), 150); };
  const keep  = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };

  const activeSub = NAV.find(n => n.label === activeMenu)?.sub || [];

  return (
    <>
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-[300px] bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="font-sans font-800 text-xl tracking-tight text-jet">
                Lumière
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-[#666] hover:text-jet p-1 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              {NAV.map(item => (
                <div key={item.label}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-5 py-3.5 text-sm font-semibold border-b border-[#F5F5F5] transition-colors ${item.sale ? 'text-[#FF4D4D]' : 'text-jet hover:text-[#FF4D4D]'}`}>
                    {item.label}
                  </Link>
                  {item.sub?.length > 0 && (
                    <div className="bg-[#FAFAFA]">
                      {item.sub.map(s => (
                        <Link key={s.label} href={s.href} onClick={() => setMobileOpen(false)}
                          className="block px-9 py-2.5 text-sm text-[#666] hover:text-jet transition-colors">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-[#E8E8E8] space-y-2">
              {mounted && user ? (
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full py-3 text-sm">My Account</Link>
              ) : (
                <Link href="/account/login" onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full py-3 text-sm text-center block">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.08)]' : 'border-b border-[#F0F0F0]'}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-jet hover:text-[#FF4D4D] transition-colors">
              <Menu size={22} />
            </button>
            <Link href="/" className="font-sans font-extrabold text-xl tracking-tight text-jet hover:text-[#FF4D4D] transition-colors">
              Lumière ✦
            </Link>
          </div>

          {/* Center: nav links */}
          <nav className="hidden lg:flex items-center gap-0.5" onMouseLeave={leave}>
            {NAV.map(item => (
              <div key={item.label} className="relative"
                onMouseEnter={() => item.sub?.length ? enter(item.label) : setActiveMenu(null)}>
                <Link href={item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    item.sale
                      ? 'text-[#FF4D4D] hover:bg-[#FFE8E8]'
                      : activeMenu === item.label
                        ? 'bg-[#F5F5F5] text-jet'
                        : 'text-jet hover:bg-[#F5F5F5]'
                  }`}>
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right: icons */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchOpen(true)}
              className="p-2 text-jet hover:text-[#FF4D4D] transition-colors rounded-full hover:bg-[#F5F5F5]">
              <Search size={19} strokeWidth={2} />
            </button>
            <Link href="/account"
              className="relative p-2 text-jet hover:text-[#FF4D4D] transition-colors rounded-full hover:bg-[#F5F5F5]">
              <Heart size={19} strokeWidth={2} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FF4D4D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link href={mounted && user ? '/account' : '/account/login'}
              className="hidden sm:flex p-2 text-jet hover:text-[#FF4D4D] transition-colors rounded-full hover:bg-[#F5F5F5]">
              <User size={19} strokeWidth={2} />
            </Link>
            <button onClick={openCart}
              className="relative flex items-center gap-2 ml-1 bg-jet hover:bg-[#333] text-white pl-3 pr-4 py-2 rounded-full text-sm font-semibold transition-colors">
              <ShoppingBag size={16} strokeWidth={2} />
              <span>{mounted && cartCount > 0 ? cartCount : 'Bag'}</span>
            </button>
          </div>
        </div>

        {/* Mega dropdown */}
        {activeMenu && activeSub.length > 0 && (
          <div onMouseEnter={keep} onMouseLeave={leave}
            className="absolute left-0 right-0 bg-white border-b border-[#E8E8E8] shadow-lg z-50">
            <div className="max-w-screen-xl mx-auto px-6 py-6 flex gap-10">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#999] mb-4">{activeMenu}</p>
                <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                  {activeSub.map(s => (
                    <Link key={s.label} href={s.href} onClick={() => setActiveMenu(null)}
                      className="text-sm text-[#444] hover:text-[#FF4D4D] font-medium transition-colors">
                      {s.label}
                    </Link>
                  ))}
                </div>
                <Link href={NAV.find(n => n.label === activeMenu)?.href || '/shop'}
                  onClick={() => setActiveMenu(null)}
                  className="inline-flex items-center gap-1 mt-5 text-[11px] font-bold tracking-wide uppercase text-[#FF4D4D] hover:underline">
                  View all {activeMenu} →
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
