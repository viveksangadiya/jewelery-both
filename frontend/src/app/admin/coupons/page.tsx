'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag, Copy, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { couponsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const empty = {
  code: '', type: 'percentage' as 'percentage' | 'fixed',
  value: '', min_order_value: '0', max_discount: '', usage_limit: '', expires_at: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState<string | null>(null);

  const load = () => {
    couponsApi.getAll()
      .then(r => setCoupons(r.data.data))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(empty); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => {
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      min_order_value: String(c.min_order_value || 0),
      max_discount: c.max_discount ? String(c.max_discount) : '',
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        min_order_value: parseFloat(form.min_order_value) || 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : undefined,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : undefined,
        expires_at: form.expires_at || undefined,
      };
      if (editId) {
        await couponsApi.update(editId, payload);
        toast.success('Coupon updated!');
      } else {
        await couponsApi.create(payload);
        toast.success('Coupon created!');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await couponsApi.delete(id);
      toast.success('Coupon deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (c: any) => {
    try {
      await couponsApi.update(c.id, { is_active: !c.is_active });
      toast.success(c.is_active ? 'Coupon deactivated' : 'Coupon activated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (c: any) => c.expires_at && new Date(c.expires_at) < new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount codes for your customers</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-bold text-lg text-gray-900">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 p-1">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Coupon Code *</label>
                <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI20"
                  className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-colors" />
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Type *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white transition-colors">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    Value * {form.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
                    placeholder={form.type === 'percentage' ? '10' : '500'}
                    className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
                </div>
              </div>

              {/* Min order + Max discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Min Order (₹)</label>
                  <input type="number" value={form.min_order_value} onChange={e => set('min_order_value', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Max Discount (₹)</label>
                    <input type="number" value={form.max_discount} onChange={e => set('max_discount', e.target.value)}
                      placeholder="500"
                      className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
                  </div>
                )}
              </div>

              {/* Usage limit + Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={e => set('usage_limit', e.target.value)}
                    placeholder="Unlimited"
                    className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Expires On</label>
                  <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)}
                    className="w-full border border-gray-200 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editId ? 'Update' : 'Create'} Coupon
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <Tag size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No coupons yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first discount coupon</p>
          <button onClick={openCreate} className="mt-5 btn-gold px-6 py-2.5 rounded-xl text-sm font-medium">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => (
            <div key={c.id}
              className={`bg-white border rounded-2xl p-5 flex items-center gap-5 hover:shadow-sm transition-shadow ${
                !c.is_active || isExpired(c) ? 'opacity-60' : ''
              }`}>
              {/* Code */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">{c.code}</span>
                  <button onClick={() => copyCode(c.code)}
                    className="text-gray-400 hover:text-gray-700 transition-colors">
                    {copied === c.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                    isExpired(c) ? 'bg-red-100 text-red-600' :
                    !c.is_active ? 'bg-gray-100 text-gray-500' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {isExpired(c) ? 'Expired' : c.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                    {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 grid grid-cols-3 gap-4 text-xs text-gray-500">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Min Order</p>
                  <p className="font-medium text-gray-700">₹{c.min_order_value || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Used</p>
                  <p className="font-medium text-gray-700">
                    {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Expires</p>
                  <p className="font-medium text-gray-700">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(c)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors" title={c.is_active ? 'Deactivate' : 'Activate'}>
                  {c.is_active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => openEdit(c)}
                  className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(c.id, c.code)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
