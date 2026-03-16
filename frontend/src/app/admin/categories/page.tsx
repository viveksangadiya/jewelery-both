'use client';
import { useState, useEffect } from 'react';
import { Plus, Save, X, Tag } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', slug: '', description: '', image_url: '', sort_order: '0' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    categoriesApi.getAll()
      .then(r => setCategories(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      await categoriesApi.getAll(); // just validate connection
      // POST via direct API call since categoriesApi doesn't have create yet
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...form, sort_order: parseInt(form.sort_order) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Category created!');
      setShowModal(false);
      setForm(emptyForm);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
        ) : categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-yellow-200 transition-colors">
            <div className="h-32 bg-gray-100 relative overflow-hidden">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag size={40} className="text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="font-bold text-white text-lg">{cat.name}</h3>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{cat.description}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-gray-900">{cat.product_count || 0}</p>
                <p className="text-xs text-gray-400">products</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg text-gray-900">Add Category</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name *</label>
                <input
                  value={form.name}
                  onChange={e => { set('name', e.target.value); set('slug', autoSlug(e.target.value)); }}
                  placeholder="e.g. Rings"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => set('slug', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 font-mono text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <input
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short category description"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
