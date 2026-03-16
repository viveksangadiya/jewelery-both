'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { ordersApi, productsApi } from '@/lib/api';

const StatCard = ({ title, value, icon: Icon, change, color, bg }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
      <Icon size={22} className={color} />
    </div>
  </div>
);

const statusConfig = {
  pending:    { label: 'Pending',    icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,   color: 'text-blue-600',   bg: 'bg-blue-50' },
  processing: { label: 'Processing', icon: Package,       color: 'text-purple-600', bg: 'bg-purple-50' },
  shipped:    { label: 'Shipped',    icon: Truck,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50' },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersApi.adminGetAll({ limit: 10 }),
      productsApi.getAll({ limit: 5, sort: 'popular' }),
    ]).then(([oRes, pRes]) => {
      setOrders(oRes.data.data || []);
      setProducts(pRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={TrendingUp} change={12} color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} change={8} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Products" value={products.length} icon={Package} change={-2} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Customers" value="—" icon={Users} change={15} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* Order status breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Order Status Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className={`${cfg.bg} rounded-xl p-4`}>
                <cfg.icon size={18} className={`${cfg.color} mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{statusCounts[key] || 0}</p>
                <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Add New Product', href: '/admin/products?action=add', color: 'bg-yellow-500 hover:bg-yellow-600' },
              { label: 'View Pending Orders', href: '/admin/orders?status=pending', color: 'bg-blue-500 hover:bg-blue-600' },
              { label: 'Add Category', href: '/admin/categories', color: 'bg-purple-500 hover:bg-purple-600' },
              { label: 'View Store', href: '/', color: 'bg-gray-700 hover:bg-gray-800' },
            ].map(a => (
              <a key={a.label} href={a.href} className={`block ${a.color} text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors text-center`}>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-yellow-600 font-medium hover:underline">View All →</a>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 8).map(order => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <a href={`/admin/orders?id=${order.id}`} className="font-mono text-xs text-yellow-700 hover:underline font-semibold">
                          {order.order_number}
                        </a>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-900 text-xs">{order.customer_name || '—'}</p>
                        <p className="text-gray-400 text-xs">{order.customer_email || ''}</p>
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-xs">{order.item_count} item{order.item_count > 1 ? 's' : ''}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900">₹{parseFloat(order.total).toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
