'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Heart, TrendingUp, ArrowUpRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

const TRENDING = [
  { label: 'Rings', href: '/shop?category=rings' },
  { label: 'Solitaire', href: '/shop?tags=solitaire' },
  { label: 'Earrings', href: '/shop?category=earrings' },
  { label: 'Bracelets', href: '/shop?category=bracelets' },
  { label: 'Mangalsutra', href: '/shop?category=mangalsutra' },
  { label: 'Gold Necklace', href: '/shop?category=necklaces&material=gold' },
  { label: 'Diamond Set', href: '/shop?tags=diamond&category=sets' },
  { label: 'Bangles', href: '/shop?tags=bangles' },
];

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { toggle, isWishlisted } = useWishlistStore();

  // Load "Picks for you" on open
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

  // Debounced search
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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const displayProducts = query.trim() ? results : picks;
  const sectionTitle = query.trim() ? `Results for "${query}"` : 'PICKS FOR YOU';

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
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Panel — slides in from right like Kisna */}
      <div className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

        {/* Search input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for Rings, Earrings, Necklaces, etc."
              className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
          </form>
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-gray-400 hover:text-gray-700 font-medium flex-shrink-0">
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-1">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Trending tags — only show when no query */}
          {!query.trim() && (
            <div className="px-5 pt-5 pb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-800 mb-3 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-yellow-600" /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <Link
                    key={t.label}
                    href={t.href}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-all"
                  >
                    <ArrowUpRight size={11} className="text-gray-400" />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {!query.trim() && <div className="h-px bg-gray-100 mx-5" />}

          {/* Products section */}
          <div className="px-5 pt-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-800">
                {loading ? 'Searching...' : sectionTitle}
              </p>
              {query.trim() && results.length > 0 && (
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs text-yellow-700 font-semibold hover:underline"
                >
                  View all {results.length}+ →
                </Link>
              )}
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-3 gap-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-square rounded-xl mb-2" />
                    <div className="skeleton h-2.5 rounded w-3/4 mb-1" />
                    <div className="skeleton h-2.5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.trim() && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">No results for "{query}"</p>
                <p className="text-xs text-gray-400">Try different keywords or browse categories</p>
              </div>
            )}

            {/* Product grid — 3 cols like Kisna */}
            {!loading && displayProducts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {displayProducts.map(product => {
                  const price = parseFloat(product.sale_price || product.base_price);
                  const origPrice = parseFloat(product.base_price);
                  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
                  const wishlisted = isWishlisted(product.id);

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group block"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">💍</div>
                        )}
                        {/* Wishlist heart */}
                        <button
                          onClick={e => handleWishlist(e, product.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                          <Heart
                            size={12}
                            className={wishlisted ? 'text-red-500' : 'text-gray-400'}
                            fill={wishlisted ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">₹{price.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through">₹{origPrice.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Name */}
                      <p className="text-[11px] text-gray-600 leading-tight mt-0.5 line-clamp-2">{product.name}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
