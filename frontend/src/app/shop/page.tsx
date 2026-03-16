'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

const sortOptions = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: '',
    min_price: '',
    max_price: '',
    search: searchParams.get('search') || '',
    page: 1,
  });

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data.data)).catch(console.error);
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    productsApi.getAll({ ...params, limit: 12 })
      .then(r => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value, page: 1 }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-display text-4xl font-bold text-charcoal mb-2">
            {filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Shop' : 'All Jewelry'}
          </h1>
          <p className="text-gray-500">{pagination.total} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:border-yellow-400 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filters.category || filters.min_price || filters.max_price) && (
              <span className="w-5 h-5 bg-yellow-600 text-white rounded-full text-xs flex items-center justify-center">!</span>
            )}
          </button>

          <div className="flex items-center gap-4">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          {filtersOpen && (
            <aside className="w-64 flex-shrink-0 space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Categories</h3>
                  {filters.category && (
                    <button onClick={() => updateFilter('category', '')} className="text-xs text-yellow-600 hover:underline">Clear</button>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Jewelry
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${filters.category === cat.slug ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                      <span className="text-xs text-gray-400">{cat.product_count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.min_price}
                    onChange={e => updateFilter('min_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-yellow-400"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.max_price}
                    onChange={e => updateFilter('max_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200" style={{ gridAutoRows: '1fr' }}>
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="bg-white overflow-hidden">
                    <div className="skeleton aspect-[3/4]" />
                    <div className="pt-3 pb-1 px-0 space-y-2">
                      <div className="skeleton h-2.5 rounded-none w-3/4" />
                      <div className="skeleton h-2.5 rounded-none w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-2xl mb-2">💍</p>
                <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                <button
                  onClick={() => setFilters({ category: '', sort: '', min_price: '', max_price: '', search: '', page: 1 })}
                  className="mt-4 btn-gold px-6 py-2.5 rounded-xl text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap">
                  {products.map(p => (
                    <div key={p.id} className="border-r border-b border-gray-200" style={{ width: filtersOpen ? '33.333%' : '25%' }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setFilters(p => ({ ...p, page }))}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          filters.page === page
                            ? 'btn-gold'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-yellow-400'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
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
