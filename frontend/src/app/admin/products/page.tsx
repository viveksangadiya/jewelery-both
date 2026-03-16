'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Eye, X, Save, ToggleLeft, ToggleRight, Upload, Trash2, GripVertical, Type } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', slug: '', short_description: '', description: '',
  category_id: '', base_price: '', sale_price: '', material: '',
  stock: '', is_featured: false, tags: '', is_active: true,
  allow_custom_text: false, custom_text_label: 'Custom Engraving / Note', custom_text_max_length: '50',
};

const emptySize = { label: '', price_modifier: '0', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Image upload state
  const [images, setImages] = useState<{ url: string; alt_text: string; is_primary: boolean }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sizes state
  const [sizes, setSizes] = useState<{ label: string; price_modifier: string; stock: string }[]>([]);

  const fetchProducts = () => {
    setLoading(true);
    productsApi.getAll({ search, page, limit: 15 })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search, page]);
  useEffect(() => { categoriesApi.getAll().then(r => setCategories(r.data.data)); }, []);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setForm(emptyForm);
    setImages([]);
    setSizes([]);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = async (p: any) => {
    setEditId(p.id);
    setShowModal(true);
    // Set basic form immediately so modal opens fast
    setForm({
      name: p.name, slug: p.slug, short_description: p.short_description || '',
      description: p.description || '', category_id: p.category_id || '',
      base_price: p.base_price, sale_price: p.sale_price || '',
      material: p.material || '', stock: p.stock, is_featured: p.is_featured,
      tags: (p.tags || []).join(', '), is_active: p.is_active !== false,
      allow_custom_text: p.allow_custom_text || false,
      custom_text_label: p.custom_text_label || 'Custom Engraving / Note',
      custom_text_max_length: String(p.custom_text_max_length || 50),
    });
    // Set primary image immediately as placeholder
    setImages(p.primary_image ? [{ url: p.primary_image, alt_text: p.name, is_primary: true }] : []);
    setSizes([]);

    // Fetch FULL product to get all images + sizes
    try {
      const res = await productsApi.getBySlug(p.slug);
      const full = res.data.data;
      // All images from DB
      setImages(
        full.images?.length
          ? full.images.map((img: any) => ({
              url: img.image_url, alt_text: img.alt_text || full.name, is_primary: img.is_primary || false,
            }))
          : p.primary_image ? [{ url: p.primary_image, alt_text: p.name, is_primary: true }] : []
      );
      // All sizes from DB
      setSizes(full.sizes?.map((s: any) => ({
        label: s.label, price_modifier: String(s.price_modifier || 0), stock: String(s.stock || 0),
      })) || []);
    } catch (err) {
      console.error('Failed to fetch full product:', err);
    }
  };

  // Upload image files to S3
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);

    const toUpload = Array.from(files).slice(0, 10); // max 10 at once
    const results: { url: string; alt_text: string; is_primary: boolean }[] = [];

    for (const file of toUpload) {
      try {
        // Detect content type — file.type is sometimes empty for WhatsApp/renamed files
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg',
          png: 'image/png', webp: 'image/webp', gif: 'image/gif',
        };
        const contentType = file.type || mimeMap[ext] || 'image/jpeg';

        // Always use server-side upload (more reliable than presigned for CORS issues)
        const res = await productsApi.uploadImage(file);
        results.push({ url: res.data.data.url, alt_text: form.name || file.name, is_primary: false });
      } catch (err: any) {
        console.error('Upload error:', err);
        toast.error(`Failed to upload ${file.name}: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
      }
    }

    setImages(prev => {
      const merged = [...prev, ...results];
      if (merged.length > 0 && !merged.some(i => i.is_primary)) merged[0].is_primary = true;
      return merged;
    });
    setUploadingImages(false);
    toast.success(`${results.length} image(s) uploaded!`);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some(i => i.is_primary)) next[0].is_primary = true;
      return next;
    });
  };

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  };

  const addSize = () => setSizes(prev => [...prev, { ...emptySize }]);
  const removeSize = (idx: number) => setSizes(prev => prev.filter((_, i) => i !== idx));
  const updateSize = (idx: number, key: string, val: string) => {
    setSizes(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  };

  const handleSave = async () => {
    if (!form.name || !form.base_price || !form.stock) {
      toast.error('Name, price and stock are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || autoSlug(form.name),
        base_price: parseFloat(form.base_price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        stock: parseInt(form.stock),
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        custom_text_max_length: parseInt(form.custom_text_max_length) || 50,
        images: images.map(img => ({ url: img.url, alt_text: img.alt_text, is_primary: img.is_primary })),
        sizes: sizes.filter(s => s.label.trim()).map(s => ({
          label: s.label.trim(),
          price_modifier: parseFloat(s.price_modifier) || 0,
          stock: parseInt(s.stock) || parseInt(form.stock),
        })),
        category_id: form.category_id || null,
      };

      if (editId) {
        await productsApi.update(editId, payload);
        toast.success('Product updated!');
      } else {
        await productsApi.create(payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} total products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Sizes', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => (
                    <td key={j} className="py-4 px-4"><div className="skeleton h-4 rounded w-20" /></td>
                  ))}</tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.primary_image && <img src={p.primary_image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 text-xs">{p.category_name || '—'}</td>
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">₹{parseFloat(p.sale_price || p.base_price).toLocaleString()}</p>
                      {p.sale_price && <p className="text-xs text-gray-400 line-through">₹{parseFloat(p.base_price).toLocaleString()}</p>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                      {p.stock > 0 ? p.stock : 'Out of stock'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.has_sizes
                      ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Has sizes</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <a href={`/product/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={15} />
                      </a>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === pg ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-lg text-gray-900">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b">Basic Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Product Name *</label>
                    <input value={form.name} onChange={e => { set('name', e.target.value); set('slug', autoSlug(e.target.value)); }}
                      placeholder="e.g. Gold Diamond Solitaire Ring" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Slug (URL)</label>
                    <input value={form.slug} onChange={e => set('slug', e.target.value)}
                      className={`${inputClass} font-mono text-gray-500`} />
                  </div>
                  <div>
                    <label className={labelClass}>Base Price (₹) *</label>
                    <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Sale Price (₹)</label>
                    <input type="number" value={form.sale_price} onChange={e => set('sale_price', e.target.value)} placeholder="Optional" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputClass}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Stock *</label>
                    <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Material</label>
                    <input value={form.material} onChange={e => set('material', e.target.value)} placeholder="e.g. 18K Gold, Diamond" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Tags (comma-separated)</label>
                    <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="gold, ring, diamond" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Short Description</label>
                    <input value={form.short_description} onChange={e => set('short_description', e.target.value)} placeholder="Brief tagline" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Full product description..." className={`${inputClass} resize-none`} />
                  </div>
                  <div className="sm:col-span-2 flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => set('is_featured', !form.is_featured)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${form.is_featured ? 'bg-yellow-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => set('is_active', !form.is_active)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b">Product Images (AWS S3)</h3>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => handleImageFiles(e.target.files)} />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all mb-4"
                >
                  {uploadingImages ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Uploading to S3...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB each. First image is primary.</p>
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${img.is_primary ? 'border-yellow-500' : 'border-gray-200'}`}>
                        <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.is_primary && (
                            <button onClick={() => setPrimary(i)}
                              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-lg font-medium">
                              Set Primary
                            </button>
                          )}
                          <button onClick={() => removeImage(i)} className="p-1.5 bg-red-500 text-white rounded-lg">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {img.is_primary && (
                          <span className="absolute top-1.5 left-1.5 text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded font-medium">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Options */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h3 className="text-sm font-bold text-gray-700">Size Options</h3>
                  <button onClick={addSize} className="flex items-center gap-1.5 text-xs text-yellow-600 hover:text-yellow-700 font-semibold">
                    <Plus size={14} /> Add Size
                  </button>
                </div>

                {sizes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No sizes added. Click "Add Size" to add ring sizes, clothing sizes, etc.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase px-1 mb-1">
                      <span>Size Label</span>
                      <span>Extra Price (₹)</span>
                      <span>Stock</span>
                    </div>
                    {sizes.map((size, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-center">
                        <input value={size.label} onChange={e => updateSize(i, 'label', e.target.value)}
                          placeholder="e.g. 6, S, Free Size" className={inputClass} />
                        <input type="number" value={size.price_modifier} onChange={e => updateSize(i, 'price_modifier', e.target.value)}
                          placeholder="0" className={inputClass} />
                        <div className="flex gap-1">
                          <input type="number" value={size.stock} onChange={e => updateSize(i, 'stock', e.target.value)}
                            placeholder={form.stock} className={inputClass} />
                          <button onClick={() => removeSize(i)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0">
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Text / Engraving */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Type size={15} /> Custom Text / Engraving
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => set('allow_custom_text', !form.allow_custom_text)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.allow_custom_text ? 'bg-yellow-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.allow_custom_text ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Enable</span>
                  </label>
                </div>

                {form.allow_custom_text && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Field Label (shown to customer)</label>
                      <input value={form.custom_text_label} onChange={e => set('custom_text_label', e.target.value)}
                        placeholder="e.g. Custom Engraving, Special Note" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Max Characters</label>
                      <input type="number" value={form.custom_text_max_length} onChange={e => set('custom_text_max_length', e.target.value)}
                        placeholder="50" className={inputClass} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
                {editId ? 'Update' : 'Create'} Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
