'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, X, SlidersHorizontal } from 'lucide-react';
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
    <div className="border-b border-[#E8E0D4] py-5">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left mb-0">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1A1410]">{title}</span>
        {open ? <ChevronUp size={14} className="text-[#9A8070]" /> : <ChevronDown size={14} className="text-[#9A8070]" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

// Simple price range slider component
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
        <span className="text-xs text-[#6B5344]">₹{local[0].toLocaleString()}</span>
        <span className="text-xs text-[#6B5344]">₹{local[1].toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 bg-[#E8E0D4] rounded-full">
        {/* Track fill */}
        <div className="absolute h-full bg-[#B8892A] rounded-full"
          style={{
            left: `${((local[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((local[1] - min) / (max - min)) * 100}%`,
          }} />
        {/* Min thumb */}
        <input type="range" min={min} max={max} step={100} value={local[0]}
          onChange={e => { const v = parseInt(e.target.value); if (v < local[1]) update([v, local[1]]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
        {/* Max thumb */}
        <input type="range" min={min} max={max} step={100} value={local[1]}
          onChange={e => { const v = parseInt(e.target.value); if (v > local[0]) update([local[0], v]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
        {/* Visual thumbs */}
        <div className="absolute w-4 h-4 bg-white border-2 border-[#B8892A] rounded-full -translate-y-1/2 -translate-x-1/2 top-1/2 shadow-sm pointer-events-none"
          style={{ left: `${((local[0] - min) / (max - min)) * 100}%`, zIndex: 2 }} />
        <div className="absolute w-4 h-4 bg-white border-2 border-[#B8892A] rounded-full -translate-y-1/2 -translate-x-1/2 top-1/2 shadow-sm pointer-events-none"
          style={{ left: `${((local[1] - min) / (max - min)) * 100}%`, zIndex: 2 }} />
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [priceLoaded, setPriceLoaded] = useState(false);
  const [filters, setFilters]       = useState({
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort') || '',
    min_price: '',
    max_price: '',
    search:   searchParams.get('search') || '',
    page:     1,
  });

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data.data)).catch(console.error);
    // Get filter options to set real price range
    productsApi.getAll({ limit: 1 } as any).then(() => {
      // Rough estimate — set range based on common jewelry prices
      setPriceRange([0, 200000]);
      setPriceLoaded(true);
    });
  }, []);

  const [activePriceRange, setActivePriceRange] = useState<[number, number]>([0, 200000]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params: any = { limit: 12, page: filters.page };
    if (filters.category) params.category = filters.category;
    if (filters.sort)     params.sort     = filters.sort;
    if (filters.search)   params.search   = filters.search;
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
    setActivePriceRange([0, 200000]);
  };

  const currentCategoryName = categories.find(c => c.slug === filters.category)?.name;

  const Sidebar = () => (
    <aside className="w-full lg:w-56 xl:w-60 flex-shrink-0">
      {/* Active filters header */}
      <div className="flex items-center justify-between mb-1 pb-4 border-b border-[#E8E0D4]">
        <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1A1410]">Filters</h2>
        {activeFiltersCount > 0 && (
          <button onClick={clearAll}
            className="text-[9px] tracking-[0.15em] uppercase text-[#B8892A] hover:text-[#96711E] transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Price */}
      <FilterSection title="Price">
        <PriceRange
          min={0} max={200000}
          value={activePriceRange}
          onChange={v => {
            setActivePriceRange(v);
            updateFilter('min_price', v[0] > 0 ? String(v[0]) : '');
            updateFilter('max_price', v[1] < 200000 ? String(v[1]) : '');
          }}
        />
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Product Category">
        <div className="space-y-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => updateFilter('category', '')}
              className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                !filters.category ? 'bg-[#1A1410] border-[#1A1410]' : 'border-[#C8B8A8] group-hover:border-[#1A1410]'
              }`}>
              {!filters.category && <span className="text-white text-[8px]">✓</span>}
            </div>
            <span className={`text-sm font-light transition-colors ${!filters.category ? 'text-[#1A1410] font-medium' : 'text-[#6B5344] group-hover:text-[#1A1410]'}`}>
              All Jewelry
            </span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => updateFilter('category', filters.category === cat.slug ? '' : cat.slug)}
                className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                  filters.category === cat.slug ? 'bg-[#1A1410] border-[#1A1410]' : 'border-[#C8B8A8] group-hover:border-[#1A1410]'
                }`}>
                {filters.category === cat.slug && <span className="text-white text-[8px]">✓</span>}
              </div>
              <span className={`text-sm font-light flex-1 transition-colors ${filters.category === cat.slug ? 'text-[#1A1410] font-medium' : 'text-[#6B5344] group-hover:text-[#1A1410]'}`}>
                {cat.name}
              </span>
              <span className="text-[10px] text-[#9A8070]">({cat.product_count || 0})</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#1A1410]/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-72 bg-[#FAF8F4] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-[#1A1410]">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-[#9A8070]"><X size={20} /></button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            {/* Product count like image 2 */}
            {!loading && (
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#3D2E1E]">
                {pagination.total} Products
                {currentCategoryName && (
                  <span className="text-[#9A8070] font-normal ml-2">in {currentCategoryName}</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-[#D8C8B8] bg-white px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-[#3D2E1E] hover:border-[#1A1410] transition-colors">
              <SlidersHorizontal size={14} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className="appearance-none border border-[#D8C8B8] bg-white px-5 py-2.5 pr-10 text-xs tracking-[0.15em] uppercase text-[#3D2E1E] outline-none hover:border-[#1A1410] focus:border-[#1A1410] transition-colors cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>SORT: {opt.label.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8070] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {filters.category && (
              <button onClick={() => updateFilter('category', '')}
                className="flex items-center gap-1.5 bg-[#1A1410] text-[#FAF8F4] text-[10px] px-3 py-1.5 tracking-[0.1em] uppercase hover:bg-[#3D2E1E] transition-colors">
                {currentCategoryName} <X size={10} />
              </button>
            )}
            {(filters.min_price || filters.max_price) && (
              <button onClick={() => { updateFilter('min_price', ''); updateFilter('max_price', ''); setActivePriceRange([0, 200000]); }}
                className="flex items-center gap-1.5 bg-[#1A1410] text-[#FAF8F4] text-[10px] px-3 py-1.5 tracking-[0.1em] uppercase hover:bg-[#3D2E1E] transition-colors">
                ₹{filters.min_price || '0'} – ₹{filters.max_price || 'Any'} <X size={10} />
              </button>
            )}
          </div>
        )}

        <div className="flex gap-10 items-start">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-[3/4] rounded-sm" />
                    <div className="mt-3 space-y-2">
                      <div className="skeleton h-3 rounded w-3/4" />
                      <div className="skeleton h-3 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-5xl text-[#E8E0D4] mb-4">✦</p>
                <h3 className="font-display text-2xl text-[#1A1410] font-normal mb-2">No pieces found</h3>
                <p className="text-sm text-[#9A8070] font-light mb-6">Try adjusting your filters</p>
                <button onClick={clearAll}
                  className="text-[10px] tracking-[0.2em] uppercase border border-[#1A1410] px-6 py-3 text-[#1A1410] hover:bg-[#1A1410] hover:text-white transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-14">
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                      disabled={filters.page === 1}
                      className="w-9 h-9 border border-[#D8C8B8] flex items-center justify-center text-[#9A8070] hover:border-[#1A1410] hover:text-[#1A1410] disabled:opacity-30 transition-colors">
                      ‹
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                      const total = pagination.pages;
                      const cur = filters.page;
                      let page: number;
                      if (total <= 7) page = i + 1;
                      else if (cur <= 4) page = i + 1;
                      else if (cur >= total - 3) page = total - 6 + i;
                      else page = cur - 3 + i;
                      return (
                        <button key={page}
                          onClick={() => setFilters(f => ({ ...f, page }))}
                          className={`w-9 h-9 text-sm border transition-colors ${
                            filters.page === page
                              ? 'bg-[#1A1410] border-[#1A1410] text-white'
                              : 'border-[#D8C8B8] text-[#6B5344] hover:border-[#1A1410] hover:text-[#1A1410]'
                          }`}>
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.min(pagination.pages, f.page + 1) }))}
                      disabled={filters.page === pagination.pages}
                      className="w-9 h-9 border border-[#D8C8B8] flex items-center justify-center text-[#9A8070] hover:border-[#1A1410] hover:text-[#1A1410] disabled:opacity-30 transition-colors">
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
