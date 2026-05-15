'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

/* ─────────────── constants ────────────────────────────── */
const SORT_OPTIONS = [
  { value: '',           label: 'Featured' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'All prices',      min: '',      max: '' },
  { label: 'Under ₹1,000',   min: '',      max: '1000' },
  { label: '₹1,000 – ₹5,000',min: '1000',  max: '5000' },
  { label: '₹5,000 – ₹15,000',min: '5000', max: '15000' },
  { label: 'Over ₹15,000',   min: '15000', max: '' },
];

const PROMO_BANNERS = [
  {
    tag:   'Limited Collection',
    title: 'Festival\nDecor Edit',
    desc:  'Handcrafted mirror-work and bead torans to light up every entrance this festival season.',
    href:  '/shop?category=festival',
    cta:   'Shop Now',
    img:   'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=1200&q=80',
  },
  {
    tag:   'Wedding Season',
    title: 'Bridal\nEntrance Decor',
    desc:  'Make every entrance feel sacred. Marigold, fabric & mirror-work torans for your special day.',
    href:  '/shop?category=wedding',
    cta:   'Discover more',
    img:   'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=1200&q=80',
  },
];

/* ─────────────── filter pill ───────────────────────────── */
function FilterPill({
  label, active, onClear, children,
}: {
  label: string; active?: boolean; onClear?: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 text-xs tracking-wide border transition-colors whitespace-nowrap ${
          active
            ? 'bg-brand-text text-white border-brand-text'
            : 'bg-white text-brand-text border-brand-border hover:border-brand-text'
        }`}
      >
        {label}
        {active && onClear
          ? <X size={10} onClick={e => { e.stopPropagation(); onClear(); }} className="ml-0.5 hover:opacity-70" />
          : <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-brand-border shadow-lg z-30 min-w-[200px]">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────── inline promo banner ──────────────────── */
function PromoBanner({ index }: { index: number }) {
  const b = PROMO_BANNERS[index % PROMO_BANNERS.length];
  return (
    <div className="col-span-full relative overflow-hidden my-2" style={{ minHeight: '220px' }}>
      <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative px-8 sm:px-14 py-12 sm:py-16 max-w-xl">
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/70 mb-3 font-medium">{b.tag}</p>
        <h3 className="font-serif text-2xl sm:text-3xl text-white leading-tight mb-3">
          {b.title.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
        </h3>
        <p className="text-xs text-white/70 mb-6 leading-relaxed max-w-xs">{b.desc}</p>
        <Link href={b.href} className="btn-brand" style={{ background: '#fff', color: '#000', height: '40px', fontSize: '11px' }}>
          {b.cta}
        </Link>
      </div>
    </div>
  );
}

/* ─────────────── page ──────────────────────────────────── */
export default function ShopPage() {
  const searchParams = useSearchParams();

  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal]           = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [filters, setFilters] = useState({
    category:  searchParams.get('category') || '',
    sort:      searchParams.get('sort')     || '',
    search:    searchParams.get('search')   || '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  /* fetch — replaces list */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setPage(1);
    const params: any = { limit: 12, page: 1 };
    if (filters.category)  params.category  = filters.category;
    if (filters.sort)      params.sort      = filters.sort;
    if (filters.search)    params.search    = filters.search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;

    productsApi.getAll(params)
      .then(r => {
        const data = r.data.data || [];
        const pag  = r.data.pagination || {};
        setProducts(data);
        setTotal(pag.total || data.length);
        setHasMore((pag.page || 1) < (pag.pages || 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* load more — appends */
  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const params: any = { limit: 12, page: nextPage };
    if (filters.category)  params.category  = filters.category;
    if (filters.sort)      params.sort      = filters.sort;
    if (filters.search)    params.search    = filters.search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;

    productsApi.getAll(params)
      .then(r => {
        const data = r.data.data || [];
        const pag  = r.data.pagination || {};
        setProducts(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(nextPage < (pag.pages || 1));
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  };

  const set = (key: string, val: string) =>
    setFilters(p => ({ ...p, [key]: val }));

  const clearAll = () =>
    setFilters({ category: '', sort: '', search: '', min_price: '', max_price: '' });

  const currentCat    = categories.find(c => c.slug === filters.category);
  const activePriceR  = PRICE_RANGES.find(r => r.min === filters.min_price && r.max === filters.max_price);
  const activeFilters = [filters.category, filters.min_price || filters.max_price].filter(Boolean).length;

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EB' }}>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-80 bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <span className="text-sm font-medium tracking-widest uppercase">Filters</span>
              <button onClick={() => setMobileOpen(false)}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Category */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-3">Category</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" checked={!filters.category} onChange={() => set('category', '')} className="accent-black" />
                    <span className="text-sm text-brand-text">All Products</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" checked={filters.category === cat.slug} onChange={() => set('category', cat.slug)} className="accent-black" />
                      <span className="text-sm text-brand-text">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-3">Price</p>
                <div className="space-y-2">
                  {PRICE_RANGES.map(r => (
                    <label key={r.label} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={filters.min_price === r.min && filters.max_price === r.max}
                        onChange={() => { set('min_price', r.min); set('max_price', r.max); }}
                        className="accent-black"
                      />
                      <span className="text-sm text-brand-text">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-3">Sort By</p>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(o => (
                    <label key={o.value} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" checked={filters.sort === o.value} onChange={() => set('sort', o.value)} className="accent-black" />
                      <span className="text-sm text-brand-text">{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex gap-3">
              <button onClick={clearAll} className="flex-1 btn-brand-outline" style={{ height: '44px', fontSize: '11px' }}>Clear All</button>
              <button onClick={() => setMobileOpen(false)} className="flex-1 btn-brand" style={{ height: '44px', fontSize: '11px' }}>Apply</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-text transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-text transition-colors">Shop</Link>
          {currentCat && (
            <>
              <span>/</span>
              <span className="text-brand-text">{currentCat.name}</span>
            </>
          )}
          {filters.search && (
            <>
              <span>/</span>
              <span className="text-brand-text">"{filters.search}"</span>
            </>
          )}
        </nav>

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-text mb-2">
            {currentCat?.name || filters.search ? `Search: ${filters.search}` : 'All Products'}
          </h1>
          {currentCat?.description && (
            <p className="text-sm text-brand-secondary max-w-xl leading-relaxed">{currentCat.description}</p>
          )}
        </div>

        {/* ── Filter bar ── */}
        <div
          className="flex items-center justify-between gap-3 flex-wrap py-4 mb-6"
          style={{ borderTop: '1px solid #E0D9D0', borderBottom: '1px solid #E0D9D0' }}
        >
          {/* Left: result count */}
          <p className="text-xs text-brand-secondary whitespace-nowrap">
            {loading ? '…' : `${total} Results`}
          </p>

          {/* Middle: filter pills (desktop) */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {/* Category pill */}
            <FilterPill
              label={currentCat ? currentCat.name : 'Category'}
              active={!!filters.category}
              onClear={() => set('category', '')}
            >
              <div className="py-2">
                <button
                  onClick={() => set('category', '')}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-hover transition-colors ${!filters.category ? 'font-medium text-brand-text' : 'text-brand-secondary'}`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => set('category', cat.slug)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-hover transition-colors flex items-center justify-between ${filters.category === cat.slug ? 'font-medium text-brand-text' : 'text-brand-secondary'}`}
                  >
                    {cat.name}
                    <span className="text-[10px] text-brand-muted">({cat.product_count || 0})</span>
                  </button>
                ))}
              </div>
            </FilterPill>

            {/* Price pill */}
            <FilterPill
              label={activePriceR && activePriceR.label !== 'All prices' ? activePriceR.label : 'Price'}
              active={!!(filters.min_price || filters.max_price)}
              onClear={() => { set('min_price', ''); set('max_price', ''); }}
            >
              <div className="py-2">
                {PRICE_RANGES.map(r => (
                  <button
                    key={r.label}
                    onClick={() => { set('min_price', r.min); set('max_price', r.max); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-hover transition-colors ${filters.min_price === r.min && filters.max_price === r.max ? 'font-medium text-brand-text' : 'text-brand-secondary'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </FilterPill>

            {/* Clear all */}
            {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-brand-secondary hover:text-brand-text transition-colors underline underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Right: Sort + mobile filter */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => set('sort', e.target.value)}
                className="appearance-none bg-white border border-brand-border text-xs text-brand-text px-4 py-2 pr-8 outline-none cursor-pointer hover:border-brand-text transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>Sort: {o.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted" />
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="sm:hidden flex items-center gap-2 px-4 py-2 text-xs border border-brand-border bg-white text-brand-text hover:border-brand-text transition-colors"
            >
              <SlidersHorizontal size={13} />
              Filter {activeFilters > 0 && `(${activeFilters})`}
            </button>
          </div>
        </div>

        {/* ── Active chips (mobile) ── */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 sm:hidden">
            {filters.category && (
              <button
                onClick={() => set('category', '')}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-brand-text text-white"
              >
                {currentCat?.name} <X size={9} />
              </button>
            )}
            {(filters.min_price || filters.max_price) && (
              <button
                onClick={() => { set('min_price', ''); set('max_price', ''); }}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-brand-text text-white"
              >
                {activePriceR?.label} <X size={9} />
              </button>
            )}
          </div>
        )}

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(12).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[3/4]" />
                <div className="mt-3 space-y-2">
                  <div className="skeleton h-2.5 w-3/4" />
                  <div className="skeleton h-2.5 w-1/2" />
                  <div className="skeleton h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-28">
            <p className="font-serif text-3xl text-brand-text mb-3">No products found</p>
            <p className="text-sm text-brand-secondary mb-8">Try adjusting your filters or search term</p>
            <button onClick={clearAll} className="btn-brand-outline">Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p, idx) => (
                <>
                  <div key={p.id} className="bg-white">
                    <ProductCard product={p} />
                  </div>
                  {/* Inline promo banner after every 8 products */}
                  {(idx + 1) % 8 === 0 && idx < products.length - 1 && (
                    <PromoBanner key={`promo-${idx}`} index={Math.floor(idx / 8)} />
                  )}
                </>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-14">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-brand-outline px-16 py-3 text-xs tracking-widest uppercase disabled:opacity-60"
                  style={{ height: '48px' }}
                >
                  {loadingMore
                    ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                    : 'Load more'}
                </button>
              </div>
            )}

            {/* Count summary */}
            {!hasMore && products.length > 0 && (
              <p className="text-center text-xs text-brand-muted mt-12">
                Showing {products.length} of {total} products
              </p>
            )}
          </>
        )}

        {/* ── SEO text section ── */}
        {!loading && currentCat && (
          <div className="mt-20 pt-10" style={{ borderTop: '1px solid #E0D9D0' }}>
            <h2 className="font-serif text-xl text-brand-text mb-3">{currentCat.name}</h2>
            <p className="text-sm text-brand-secondary leading-relaxed max-w-3xl">
              {currentCat.description ||
                `Explore our handcrafted ${currentCat.name} collection, made by skilled artisans across India using traditional techniques passed down through generations. Every piece is unique and tells a story of heritage and devotion.`
              }
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-brand-muted">
              <span>You may also like:</span>
              {categories.filter(c => c.slug !== filters.category).slice(0, 4).map(c => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className="hover:text-brand-text transition-colors underline underline-offset-2">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
