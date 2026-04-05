'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Heart, ArrowRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

const TRENDING = [
  { label: 'Door Torans',   href: '/shop?category=door-torans' },
  { label: 'Mirror Work',   href: '/shop?category=door-torans&tag=mirror' },
  { label: 'Diwali Torans', href: '/shop?category=festival&tag=diwali' },
  { label: 'Wedding Decor', href: '/shop?category=wedding' },
  { label: 'Wall Hangings', href: '/shop?category=wall-hangings' },
  { label: 'Fabric Torans', href: '/shop?category=door-torans&tag=fabric' },
  { label: 'Gift Sets',     href: '/shop?category=gift-sets' },
  { label: 'Beaded Torans', href: '/shop?category=door-torans&tag=beaded' },
];

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [picks, setPicks]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      if (picks.length === 0) {
        productsApi.getAll({ sort: 'popular', limit: 6 } as any)
          .then(r => setPicks(r.data.data.slice(0, 6)))
          .catch(() => {});
      }
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      productsApi.getAll({ search: query, limit: 9 } as any)
        .then(r => setResults(r.data.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const displayProducts = query.trim() ? results : picks;
  const sectionLabel    = query.trim() ? `Results for "${query}"` : 'Popular Picks';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      window.location.href = `/shop?search=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const was = isWishlisted(productId);
    await toggle(productId);
    toast.success(was ? 'Removed from wishlist' : 'Saved!', { icon: '❤️' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] transition-opacity"
        style={{ backgroundColor: 'rgba(100,35,8,0.3)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[460px] flex flex-col overflow-hidden animate-slide-in-right"
        style={{ backgroundColor: '#FAF9EE', borderLeft: '1px solid #EBEBCA' }}
      >
        {/* ── Search bar ── */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid #EBEBCA' }}
        >
          <Search size={16} style={{ color: '#B68868', flexShrink: 0 }} />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search torans, wall hangings, gift sets…"
              className="w-full text-sm outline-none bg-transparent"
              style={{ color: '#642308' }}
            />
          </form>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-medium flex-shrink-0 tracking-wide transition-colors"
              style={{ color: '#B68868' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-1 transition-colors"
            style={{ color: '#903E1D' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Trending tags — only without query */}
          {!query.trim() && (
            <div className="px-5 pt-6 pb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: '#B68868' }}>
                Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <Link
                    key={t.label}
                    href={t.href}
                    onClick={onClose}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium tracking-wide transition-all"
                    style={{ border: '1px solid #EBEBCA', color: '#903E1D' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#B68868';
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#EBEBCA';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#EBEBCA';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <ArrowRight size={10} style={{ color: '#B68868' }} />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {!query.trim() && <div className="mx-5 h-px" style={{ backgroundColor: '#EBEBCA' }} />}

          {/* Products section */}
          <div className="px-5 pt-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#642308' }}>
                {loading ? 'Searching…' : sectionLabel}
              </p>
              {query.trim() && results.length > 0 && (
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: '#903E1D' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
                  View all →
                </Link>
              )}
            </div>

            {/* Skeletons */}
            {loading && (
              <div className="grid grid-cols-3 gap-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-square mb-2" />
                    <div className="skeleton h-2 w-3/4 mb-1.5" />
                    <div className="skeleton h-2 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.trim() && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-2xl mb-3">🪢</p>
                <p className="text-sm font-semibold mb-1" style={{ color: '#642308' }}>
                  No results for "{query}"
                </p>
                <p className="text-xs" style={{ color: '#B68868' }}>
                  Try different keywords or browse categories
                </p>
              </div>
            )}

            {/* Product grid */}
            {!loading && displayProducts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {displayProducts.map(product => {
                  const price      = parseFloat(product.sale_price || product.base_price);
                  const origPrice  = parseFloat(product.base_price);
                  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
                  const wishlisted  = isWishlisted(product.id);

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group block"
                    >
                      {/* Image */}
                      <div
                        className="relative aspect-square overflow-hidden mb-2"
                        style={{ backgroundColor: '#EBEBCA' }}
                      >
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🪢</div>
                        )}
                        {/* Wishlist */}
                        <button
                          onClick={e => handleWishlist(e, product.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center transition-all"
                          style={{ backgroundColor: 'rgba(250,249,238,0.9)' }}
                        >
                          <Heart
                            size={11}
                            style={{ color: wishlisted ? '#903E1D' : '#B68868' }}
                            fill={wishlisted ? '#903E1D' : 'none'}
                          />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: '#642308' }}>
                          ₹{price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] line-through" style={{ color: '#B68868' }}>
                            ₹{origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <p className="text-[11px] leading-snug mt-0.5 line-clamp-2" style={{ color: '#903E1D' }}>
                        {product.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer CTA ── */}
        {!query.trim() && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid #EBEBCA' }}>
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
              Browse All Products <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
