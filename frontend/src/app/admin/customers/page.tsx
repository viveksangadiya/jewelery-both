'use client';
import { useState, useEffect } from 'react';
import { Search, User, Shield } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/auth/admin/customers').then(r => setCustomers(r.data.data || [])).catch(() => {
      // Fallback: show placeholder if endpoint not ready
      setCustomers([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} registered customers</p>
      </div>

      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 w-72"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <User size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">No customers yet</p>
            <p className="text-gray-300 text-sm mt-1">Customers will appear here once they register</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Orders'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">{c.email}</td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">{c.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.role === 'admin' && <Shield size={11} />}
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{c.order_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
