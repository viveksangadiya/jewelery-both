'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight, ChevronLeft, Heart, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface NavChild {
  label: string;
  href:  string;
}
interface NavItem {
  label:    string;
  href:     string;
  children?: NavChild[];
}
interface NavSection {
  label:    string;
  href:     string;
  image?:   string;
  items:    NavItem[];
}

const NAV_DATA: NavSection[] = [
  {
    label: 'New In',
    href:  '/shop?sort=newest',
    items: [
      { label: 'All New Arrivals',  href: '/shop?sort=newest' },
      { label: 'New Jewelry',       href: '/shop?category=jewelry&sort=newest' },
      { label: 'New Festival Decor',href: '/shop?category=festival&sort=newest' },
      { label: 'Online Exclusives', href: '/shop?tag=exclusive' },
    ],
  },
  {
    label: 'Jewelry',
    href:  '/shop?category=jewelry',
    items: [
      { label: 'All Jewelry',          href: '/shop?category=jewelry' },
      { label: 'Necklaces & Pendants', href: '/shop?category=jewelry&tag=necklace',
        children: [
          { label: 'All Necklaces',  href: '/shop?category=jewelry&tag=necklace' },
          { label: 'Layered Sets',   href: '/shop?category=jewelry&tag=layered' },
          { label: 'Temple Style',   href: '/shop?category=jewelry&tag=temple' },
          { label: 'Chain Necklaces',href: '/shop?category=jewelry&tag=chain' },
        ],
      },
      { label: 'Bracelets',  href: '/shop?category=jewelry&tag=bracelet' },
      { label: 'Earrings',   href: '/shop?category=jewelry&tag=earring',
        children: [
          { label: 'All Earrings',    href: '/shop?category=jewelry&tag=earring' },
          { label: 'Jhumka Earrings', href: '/shop?category=jewelry&tag=jhumka' },
          { label: 'Drop Earrings',   href: '/shop?category=jewelry&tag=drop' },
          { label: 'Stud Earrings',   href: '/shop?category=jewelry&tag=stud' },
          { label: 'Chandbali',       href: '/shop?category=jewelry&tag=chandbali' },
        ],
      },
      { label: 'Rings',    href: '/shop?category=jewelry&tag=ring' },
      { label: 'Anklets',  href: '/shop?category=jewelry&tag=anklet' },
      { label: 'Sets',     href: '/shop?category=jewelry&tag=set' },
    ],
  },
  {
    label: 'Door Torans',
    href:  '/shop?category=door-torans',
    items: [
      { label: 'All Door Torans',    href: '/shop?category=door-torans' },
      { label: 'Traditional Torans', href: '/shop?category=door-torans&tag=traditional' },
      { label: 'Fabric & Thread',    href: '/shop?category=door-torans&tag=fabric' },
      { label: 'Beaded Torans',      href: '/shop?category=door-torans&tag=beaded' },
      { label: 'Mirror Work Torans', href: '/shop?category=door-torans&tag=mirror' },
      { label: 'Tassel Torans',      href: '/shop?category=door-torans&tag=tassel' },
    ],
  },
  {
    label: 'Festival',
    href:  '/shop?category=festival',
    items: [
      { label: 'All Festival',     href: '/shop?category=festival' },
      { label: 'Diwali Special',   href: '/shop?category=festival&tag=diwali' },
      { label: 'Navratri',         href: '/shop?category=festival&tag=navratri' },
      { label: 'Puja Decor',       href: '/shop?category=festival&tag=puja' },
      { label: 'Holi Collection',  href: '/shop?category=festival&tag=holi' },
    ],
  },
  {
    label: 'Wedding',
    href:  '/shop?category=wedding',
    items: [
      { label: 'All Wedding',           href: '/shop?category=wedding' },
      { label: 'Bridal Entrance Torans',href: '/shop?category=wedding&tag=bridal' },
      { label: 'Marigold Torans',       href: '/shop?category=wedding&tag=marigold' },
      { label: 'Floral Decorations',    href: '/shop?category=wedding&tag=floral' },
      { label: 'Premium Sets',          href: '/shop?category=wedding&tag=premium' },
    ],
  },
  {
    label: 'Wall Hangings',
    href:  '/shop?category=wall-hangings',
    items: [
      { label: 'All Wall Hangings',  href: '/shop?category=wall-hangings' },
      { label: 'Macrame Hangings',   href: '/shop?category=wall-hangings&tag=macrame' },
      { label: 'Boho Dreamcatchers', href: '/shop?category=wall-hangings&tag=boho' },
      { label: 'Woven Art',          href: '/shop?category=wall-hangings&tag=woven' },
    ],
  },
  {
    label: 'Gifts',
    href:  '/shop?category=gift-sets',
    items: [
      { label: 'All Gift Sets',   href: '/shop?category=gift-sets' },
      { label: 'Festival Gifts',  href: '/shop?category=gift-sets&tag=festival' },
      { label: 'Wedding Gifts',   href: '/shop?category=gift-sets&tag=wedding' },
      { label: 'Gift Packaging',  href: '/shop?tag=packaging' },
    ],
  },
];

interface MegaMenuProps {
  open:    boolean;
  onClose: () => void;
}

type PanelLevel = 'root' | 'section' | 'item';

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  const [panel, setPanel]         = useState<PanelLevel>('root');
  const [activeSection, setActiveSection] = useState<NavSection | null>(null);
  const [activeItem, setActiveItem]       = useState<NavItem | null>(null);
  const [mounted, setMounted]     = useState(false);

  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) {
      setPanel('root');
      setActiveSection(null);
      setActiveItem(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Menu panel */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] bg-white h-full flex flex-col shadow-2xl animate-slide-in-left overflow-hidden">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border flex-shrink-0">
          {panel !== 'root' ? (
            <button
              onClick={() => {
                if (panel === 'item') { setPanel('section'); setActiveItem(null); }
                else { setPanel('root'); setActiveSection(null); }
              }}
              className="flex items-center gap-2 text-sm font-medium text-brand-text hover:text-brand-secondary transition-colors"
            >
              <ChevronLeft size={16} />
              {panel === 'item' ? activeSection?.label : 'Menu'}
            </button>
          ) : (
            <span className="text-sm font-medium tracking-widest uppercase text-brand-text">Menu</span>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-brand-hover transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-brand-text" />
          </button>
        </div>

        {/* ── Panels ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ROOT panel */}
          {panel === 'root' && (
            <nav className="animate-menu-in">
              {NAV_DATA.map((section) => (
                <button
                  key={section.label}
                  onClick={() => { setActiveSection(section); setPanel('section'); }}
                  className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-brand-text hover:bg-brand-hover transition-colors border-b border-brand-border/50 text-left"
                >
                  {section.label}
                  <ChevronRight size={15} className="text-brand-muted" />
                </button>
              ))}
              <Link
                href="/shop?sale=true"
                onClick={handleClose}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-sale hover:bg-brand-hover transition-colors border-b border-brand-border/50"
              >
                Sale
              </Link>
            </nav>
          )}

          {/* SECTION panel */}
          {panel === 'section' && activeSection && (
            <nav className="animate-menu-in">
              <Link
                href={activeSection.href}
                onClick={handleClose}
                className="flex items-center px-6 py-4 text-sm font-semibold text-brand-text hover:bg-brand-hover border-b border-brand-border transition-colors"
              >
                All {activeSection.label}
              </Link>
              {activeSection.items.filter(i => i.label !== `All ${activeSection.label}` && !i.label.startsWith('All ')).map((item) => (
                item.children ? (
                  <button
                    key={item.label}
                    onClick={() => { setActiveItem(item); setPanel('item'); }}
                    className="w-full flex items-center justify-between px-6 py-4 text-sm text-brand-text hover:bg-brand-hover transition-colors border-b border-brand-border/50 text-left"
                  >
                    {item.label}
                    <ChevronRight size={14} className="text-brand-muted" />
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleClose}
                    className="flex items-center px-6 py-4 text-sm text-brand-text hover:bg-brand-hover transition-colors border-b border-brand-border/50"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          )}

          {/* ITEM panel (3rd level) */}
          {panel === 'item' && activeItem && activeItem.children && (
            <nav className="animate-menu-in">
              <Link
                href={activeItem.href}
                onClick={handleClose}
                className="flex items-center px-6 py-4 text-sm font-semibold text-brand-text hover:bg-brand-hover border-b border-brand-border transition-colors"
              >
                All {activeItem.label}
              </Link>
              {activeItem.children.map((child) => (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={handleClose}
                  className="flex items-center px-6 py-4 text-sm text-brand-text hover:bg-brand-hover transition-colors border-b border-brand-border/50"
                >
                  {child.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* ── Footer: account links ────────────────────── */}
        {panel === 'root' && mounted && (
          <div className="flex-shrink-0 border-t border-brand-border px-6 py-5 space-y-1">
            <Link
              href="/account/wishlist"
              onClick={handleClose}
              className="flex items-center gap-3 py-2.5 text-sm text-brand-text hover:text-brand-secondary transition-colors"
            >
              <Heart size={16} />
              Wishlist
            </Link>
            <Link
              href={user ? '/account' : '/account/login'}
              onClick={handleClose}
              className="flex items-center gap-3 py-2.5 text-sm text-brand-text hover:text-brand-secondary transition-colors"
            >
              <User size={16} />
              My Account
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-2.5 text-sm text-brand-text hover:text-brand-secondary transition-colors w-full text-left"
              >
                <LogOut size={16} />
                Log out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
