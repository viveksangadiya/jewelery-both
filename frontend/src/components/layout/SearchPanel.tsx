'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { productsApi } from '@/lib/api';

const RECOMMENDATIONS = [
  { label: 'Door Torans',   href: '/shop?category=door-torans' },
  { label: 'Mirror Work',   href: '/shop?category=door-torans&tag=mirror' },
  { label: 'Diwali Torans', href: '/shop?category=festival&tag=diwali' },
  { label: 'Wedding Decor', href: '/shop?category=wedding' },
  { label: 'Wall Hangings', href: '/shop?category=wall-hangings' },
  { label: 'Fabric Torans', href: '/shop?category=door-torans&tag=fabric' },
  { label: 'Gift Sets',     href: '/shop?category=gift-sets' },
];

interface SearchPanelProps {
  open:    boolean;
  onClose: () => void;
}

export default function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [picks, setPicks]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      window.location.href = `/shop?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={onClose}
      />

      {/* Search panel — full-screen drop-down from top */}
      <div
        className="fixed top-0 left-0 right-0 z-[70] bg-white search-panel-enter"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      >
        {/* ── Search input row ── */}
        <div
          className="flex items-center gap-4 px-6 sm:px-10 py-4 sm:py-5"
          style={{ borderBottom: '1px solid #E0D9D0' }}
        >
          <Search size={18} className="text-brand-muted flex-shrink-0" />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, collections…"
              className="w-full text-base sm:text-lg outline-none bg-transparent text-brand-text placeholder:text-brand-muted"
            />
          </form>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-medium text-brand-muted hover:text-brand-text transition-colors flex-shrink-0"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-brand-muted hover:text-brand-text transition-colors"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Content area ── */}
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-10 max-h-[70vh] overflow-y-auto">

          {/* Left: Recommendations */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-5">
              Recommendations
            </p>
            <ul className="space-y-3">
              {RECOMMENDATIONS.map(r => (
                <li key={r.label}>
                  <Link
                    href={r.href}
                    onClick={onClose}
                    className="text-sm text-brand-text hover:text-brand-secondary transition-colors"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Products */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-5">
              {query.trim()
                ? (loading ? 'Searching…' : `Results for "${query}"`)
                : 'Our Bestsellers'}
            </p>

            {/* Skeletons */}
            {loading && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
              <div className="py-10">
                <p className="text-sm font-medium text-brand-text mb-1">No results for "{query}"</p>
                <p className="text-xs text-brand-muted">Try different keywords or browse categories</p>
              </div>
            )}

            {/* Product grid */}
            {!loading && displayProducts.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {displayProducts.map(product => {
                  const price = parseFloat(product.sale_price || product.base_price);
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group block"
                    >
                      <div
                        className="aspect-square overflow-hidden mb-2 bg-brand-hover"
                        style={{ backgroundColor: '#F5F0EB' }}
                      >
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🪢</div>
                        )}
                      </div>
                      <p className="text-xs text-brand-text leading-snug line-clamp-2 mb-1">
                        {product.name}
                      </p>
                      <p className="text-xs font-medium text-brand-text">
                        ₹{price.toLocaleString()}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* View all link */}
            {query.trim() && results.length > 0 && (
              <div className="mt-6">
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-sm font-medium text-brand-text underline underline-offset-4 hover:text-brand-secondary transition-colors"
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
