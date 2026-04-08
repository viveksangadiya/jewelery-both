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
  const inputRef    = useRef<HTMLInputElement>(null);
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
    toast.success(was ? 'Removed from wishlist' : 'Saved!');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[460px] flex flex-col overflow-hidden bg-white animate-slide-in-right"
        style={{ borderLeft: '1px solid #e1e1e1' }}
      >
        {/* ── Search input bar ── */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #e1e1e1' }}>
          <Search size={15} style={{ color: '#9b9b9b', flexShrink: 0 }} />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search torans, wall hangings, gift sets…"
              className="w-full text-sm outline-none bg-transparent text-[#1c1c1c] placeholder:text-[#9b9b9b]"
            />
          </form>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-medium flex-shrink-0 text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-1 text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Trending tags */}
          {!query.trim() && (
            <div className="px-5 pt-6 pb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-[#9b9b9b]">
                Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <Link
                    key={t.label}
                    href={t.href}
                    onClick={onClose}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium tracking-wide text-[#363636] transition-colors hover:text-[#1c1c1c] hover:border-[#1c1c1c]"
                    style={{ border: '1px solid #e1e1e1' }}
                  >
                    <ArrowRight size={9} style={{ color: '#9b9b9b' }} />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && <div className="mx-5 h-px" style={{ backgroundColor: '#e1e1e1' }} />}

          {/* Products section */}
          <div className="px-5 pt-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#9b9b9b]">
                {loading ? 'Searching…' : sectionLabel}
              </p>
              {query.trim() && results.length > 0 && (
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs font-semibold text-[#363636] hover:text-[#1c1c1c] transition-colors"
                >
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
                <p className="text-sm font-semibold mb-1 text-[#1c1c1c]">
                  No results for "{query}"
                </p>
                <p className="text-xs text-[#9b9b9b]">
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
                      <div className="relative aspect-square overflow-hidden mb-2" style={{ backgroundColor: '#f5f5f5' }}>
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
                          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                        >
                          <Heart
                            size={11}
                            style={{ color: wishlisted ? '#e32c2b' : '#9b9b9b' }}
                            fill={wishlisted ? '#e32c2b' : 'none'}
                          />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1c1c1c]">
                          ₹{price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] line-through text-[#9b9b9b]">
                            ₹{origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <p className="text-[11px] leading-snug mt-0.5 line-clamp-2 text-[#363636]">
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
          <div className="px-5 py-4" style={{ borderTop: '1px solid #e1e1e1' }}>
            <Link
              href="/shop"
              onClick={onClose}
              className="btn-craft w-full"
            >
              Browse All Products <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
