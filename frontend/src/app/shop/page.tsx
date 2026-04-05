'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

const SORT_OPTIONS = [
  { value: '',           label: 'Featured' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'discount',   label: 'Best Discount' },
];

function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-5" style={{ borderBottom: '1px solid #EBEBCA' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#642308' }}>{title}</span>
        {open
          ? <ChevronUp size={13} style={{ color: '#B68868' }} />
          : <ChevronDown size={13} style={{ color: '#B68868' }} />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function PriceRange({ min, max, value, onChange }: {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [local, setLocal] = useState(value);
  const timeout = useRef<any>(null);

  const update = (v: [number, number]) => {
    setLocal(v);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onChange(v), 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: '#903E1D' }}>₹{local[0].toLocaleString()}</span>
        <span className="text-xs" style={{ color: '#903E1D' }}>₹{local[1].toLocaleString()}</span>
      </div>
      <div className="relative h-1" style={{ backgroundColor: '#EBEBCA', borderRadius: 0 }}>
        <div className="absolute h-full" style={{
          backgroundColor: '#903E1D',
          left: `${((local[0] - min) / (max - min)) * 100}%`,
          right: `${100 - ((local[1] - min) / (max - min)) * 100}%`,
        }} />
        <input type="range" min={min} max={max} step={100} value={local[0]}
          onChange={e => { const v = parseInt(e.target.value); if (v < local[1]) update([v, local[1]]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
        <input type="range" min={min} max={max} step={100} value={local[1]}
          onChange={e => { const v = parseInt(e.target.value); if (v > local[0]) update([local[0], v]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
        <div className="absolute w-3.5 h-3.5 -translate-y-1/2 -translate-x-1/2 top-1/2 pointer-events-none"
          style={{ left: `${((local[0] - min) / (max - min)) * 100}%`, zIndex: 2, backgroundColor: '#FAF9EE', border: '2px solid #903E1D' }} />
        <div className="absolute w-3.5 h-3.5 -translate-y-1/2 -translate-x-1/2 top-1/2 pointer-events-none"
          style={{ left: `${((local[1] - min) / (max - min)) * 100}%`, zIndex: 2, backgroundColor: '#FAF9EE', border: '2px solid #903E1D' }} />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activePriceRange, setActivePriceRange]   = useState<[number, number]>([0, 50000]);
  const [filters, setFilters] = useState({
    category:  searchParams.get('category') || '',
    sort:      searchParams.get('sort')     || '',
    min_price: '',
    max_price: '',
    search:    searchParams.get('search')   || '',
    page:      1,
  });

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data.data)).catch(console.error);
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params: any = { limit: 12, page: filters.page };
    if (filters.category)  params.category  = filters.category;
    if (filters.sort)      params.sort      = filters.sort;
    if (filters.search)    params.search    = filters.search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    productsApi.getAll(params)
      .then(r => {
        setProducts(r.data.data || []);
        setPagination(r.data.pagination || { total: 0, pages: 1, page: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key: string, value: any) =>
    setFilters(p => ({ ...p, [key]: value, page: 1 }));

  const activeFiltersCount = [filters.category, filters.min_price, filters.max_price].filter(Boolean).length;

  const clearAll = () => {
    setFilters({ category: '', sort: '', min_price: '', max_price: '', search: '', page: 1 });
    setActivePriceRange([0, 50000]);
  };

  const currentCategoryName = categories.find(c => c.slug === filters.category)?.name;

  const Sidebar = () => (
    <aside className="w-full lg:w-52 xl:w-56 flex-shrink-0">
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #EBEBCA' }}>
        <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#642308' }}>Filters</h2>
        {activeFiltersCount > 0 && (
          <button onClick={clearAll}
            className="text-[9px] tracking-[0.15em] uppercase transition-colors"
            style={{ color: '#903E1D' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
            Clear All
          </button>
        )}
      </div>

      <FilterSection title="Price">
        <PriceRange
          min={0} max={50000}
          value={activePriceRange}
          onChange={v => {
            setActivePriceRange(v);
            updateFilter('min_price', v[0] > 0 ? String(v[0]) : '');
            updateFilter('max_price', v[1] < 50000 ? String(v[1]) : '');
          }}
        />
      </FilterSection>

      <FilterSection title="Category">
        <div className="space-y-2">
          {/* All */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => updateFilter('category', '')}
              className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                border: `1px solid ${!filters.category ? '#642308' : '#EBEBCA'}`,
                backgroundColor: !filters.category ? '#642308' : 'transparent',
              }}>
              {!filters.category && <span style={{ color: '#FAF9EE', fontSize: '8px' }}>✓</span>}
            </div>
            <span className="text-sm transition-colors"
              style={{ color: !filters.category ? '#642308' : '#903E1D', fontWeight: !filters.category ? 500 : 400 }}>
              All Products
            </span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter('category', filters.category === cat.slug ? '' : cat.slug)}
                className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  border: `1px solid ${filters.category === cat.slug ? '#642308' : '#EBEBCA'}`,
                  backgroundColor: filters.category === cat.slug ? '#642308' : 'transparent',
                }}>
                {filters.category === cat.slug && <span style={{ color: '#FAF9EE', fontSize: '8px' }}>✓</span>}
              </div>
              <span className="text-sm flex-1 transition-colors"
                style={{ color: filters.category === cat.slug ? '#642308' : '#903E1D', fontWeight: filters.category === cat.slug ? 500 : 400 }}>
                {cat.name}
              </span>
              <span className="text-[10px]" style={{ color: '#B68868' }}>({cat.product_count || 0})</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9EE' }}>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(100,35,8,0.35)' }}
            onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-72 overflow-y-auto p-6 shadow-xl"
            style={{ backgroundColor: '#FAF9EE' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#642308' }}>Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} style={{ color: '#B68868' }}>
                <X size={18} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            {!loading && (
              <p className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#642308' }}>
                {pagination.total} Products
                {currentCategoryName && (
                  <span className="font-normal ml-2" style={{ color: '#B68868' }}>in {currentCategoryName}</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors"
              style={{ border: '1px solid #EBEBCA', color: '#642308' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#B68868')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#EBEBCA')}>
              <SlidersHorizontal size={13} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className="appearance-none px-5 py-2.5 pr-8 text-xs tracking-[0.15em] uppercase outline-none cursor-pointer transition-colors bg-transparent"
                style={{
                  border: '1px solid #EBEBCA',
                  color: '#642308',
                }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>SORT: {opt.label.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#B68868' }} />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {filters.category && (
              <button
                onClick={() => updateFilter('category', '')}
                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 tracking-[0.1em] uppercase transition-colors"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
                {currentCategoryName} <X size={9} />
              </button>
            )}
            {(filters.min_price || filters.max_price) && (
              <button
                onClick={() => { updateFilter('min_price', ''); updateFilter('max_price', ''); setActivePriceRange([0, 50000]); }}
                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 tracking-[0.1em] uppercase transition-colors"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
                ₹{filters.min_price || '0'} – ₹{filters.max_price || 'Any'} <X size={9} />
              </button>
            )}
          </div>
        )}

        <div className="flex gap-10 items-start">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-[3/4]" />
                    <div className="mt-3 space-y-2">
                      <div className="skeleton h-2.5 w-3/4" />
                      <div className="skeleton h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-5" style={{ color: '#EBEBCA' }}>🪢</p>
                <h3 className="font-display text-2xl font-normal mb-2" style={{ color: '#642308' }}>No products found</h3>
                <p className="text-sm mb-8" style={{ color: '#B68868' }}>Try adjusting your filters</p>
                <button
                  onClick={clearAll}
                  className="text-[10px] tracking-[0.2em] uppercase px-8 py-3 transition-colors"
                  style={{ border: '1px solid #642308', color: '#642308' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#642308';
                    (e.currentTarget as HTMLElement).style.color = '#FAF9EE';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#642308';
                  }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-14">
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                      disabled={filters.page === 1}
                      className="w-9 h-9 flex items-center justify-center text-sm transition-colors disabled:opacity-30"
                      style={{ border: '1px solid #EBEBCA', color: '#B68868' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#642308';
                        (e.currentTarget as HTMLElement).style.color = '#642308';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#EBEBCA';
                        (e.currentTarget as HTMLElement).style.color = '#B68868';
                      }}>
                      ‹
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                      const tot = pagination.pages, cur = filters.page;
                      let page: number;
                      if (tot <= 7) page = i + 1;
                      else if (cur <= 4) page = i + 1;
                      else if (cur >= tot - 3) page = tot - 6 + i;
                      else page = cur - 3 + i;
                      return (
                        <button key={page}
                          onClick={() => setFilters(f => ({ ...f, page }))}
                          className="w-9 h-9 text-sm transition-colors"
                          style={{
                            border: `1px solid ${filters.page === page ? '#642308' : '#EBEBCA'}`,
                            backgroundColor: filters.page === page ? '#642308' : 'transparent',
                            color: filters.page === page ? '#FAF9EE' : '#903E1D',
                          }}>
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.min(pagination.pages, f.page + 1) }))}
                      disabled={filters.page === pagination.pages}
                      className="w-9 h-9 flex items-center justify-center text-sm transition-colors disabled:opacity-30"
                      style={{ border: '1px solid #EBEBCA', color: '#B68868' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#642308';
                        (e.currentTarget as HTMLElement).style.color = '#642308';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#EBEBCA';
                        (e.currentTarget as HTMLElement).style.color = '#B68868';
                      }}>
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
