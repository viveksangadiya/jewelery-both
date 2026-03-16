'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Eye, X, Truck, Package, RefreshCw, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '@/types';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const statusColors: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
  refunded:   'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AdminOrders(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [shiprocketLoading, setShiprocketLoading] = useState<number | null>(null);

  const fetchOrders = useCallback((): void => {
    setLoading(true);
    ordersApi.adminGetAll({ status: filterStatus || undefined })
      .then((r) => setOrders(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string): Promise<void> => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((p) => p ? { ...p, status: newStatus as OrderStatus } : p);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePushToShiprocket = async (orderId: number): Promise<void> => {
    setShiprocketLoading(orderId);
    try {
      await api.post(`/shiprocket/push-order/${orderId}`);
      toast.success('Order pushed to Shiprocket! 🚀');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to push to Shiprocket');
    } finally {
      setShiprocketLoading(null);
    }
  };

  const handleSchedulePickup = async (orderId: number): Promise<void> => {
    setShiprocketLoading(orderId);
    try {
      await api.post(`/shiprocket/schedule-pickup/${orderId}`);
      toast.success('Pickup scheduled! 📦');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setShiprocketLoading(null);
    }
  };

  const handleCancelShiprocket = async (orderId: number): Promise<void> => {
    if (!confirm('Cancel this order on Shiprocket?')) return;
    setShiprocketLoading(orderId);
    try {
      await api.post(`/shiprocket/cancel/${orderId}`);
      toast.success('Order cancelled on Shiprocket');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setShiprocketLoading(null);
    }
  };

  const filtered = orders.filter((o) =>
    !search ||
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const getShippingAddress = (order: Order) => {
    if (!order.shipping_address) return null;
    return typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search order / customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 w-64"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${!filterStatus ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${filterStatus === s ? 'bg-yellow-500 text-white border-yellow-500' : `${statusColors[s]} hover:opacity-80`}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Total', 'Status', 'Shiprocket', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="py-4 px-4"><div className="skeleton h-4 rounded w-16" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-yellow-700">{order.order_number}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900 text-xs">{order.customer_name || '—'}</p>
                      <p className="text-gray-400 text-xs">{order.customer_email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">₹{parseFloat(String(order.total)).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs px-2.5 py-1.5 rounded-full font-medium border cursor-pointer outline-none appearance-none pr-6 capitalize ${statusColors[order.status]} disabled:opacity-60`}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Shiprocket status & actions */}
                      {(order as any).shiprocket_order_id ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-medium">
                            <CheckCircle size={11} /> Pushed
                          </span>
                          {(order as any).awb_code && (
                            <span className="text-xs text-gray-500 font-mono">{(order as any).awb_code}</span>
                          )}
                          {!(order as any).awb_code && (
                            <button
                              onClick={() => handleSchedulePickup(order.id)}
                              disabled={shiprocketLoading === order.id}
                              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                            >
                              {shiprocketLoading === order.id
                                ? <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                : <Package size={11} />}
                              Schedule Pickup
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePushToShiprocket(order.id)}
                          disabled={shiprocketLoading === order.id || order.status === 'cancelled'}
                          className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1 font-medium disabled:opacity-50"
                        >
                          {shiprocketLoading === order.id
                            ? <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
                            : <Send size={11} />}
                          Push to SR
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status update */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${selectedOrder.status === s ? 'bg-yellow-500 text-white border-yellow-500' : `${statusColors[s]} hover:opacity-80`}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shiprocket actions */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shiprocket</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {(selectedOrder as any).shiprocket_order_id ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">SR Order ID</span>
                        <span className="font-mono font-semibold text-gray-900">{(selectedOrder as any).shiprocket_order_id}</span>
                      </div>
                      {(selectedOrder as any).shipment_id && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Shipment ID</span>
                          <span className="font-mono font-semibold text-gray-900">{(selectedOrder as any).shipment_id}</span>
                        </div>
                      )}
                      {(selectedOrder as any).awb_code && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">AWB Code</span>
                          <span className="font-mono font-semibold text-gray-900">{(selectedOrder as any).awb_code}</span>
                        </div>
                      )}
                      {(selectedOrder as any).courier_name && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Courier</span>
                          <span className="font-semibold text-gray-900">{(selectedOrder as any).courier_name}</span>
                        </div>
                      )}
                      {(selectedOrder as any).tracking_url && (
                        <a href={(selectedOrder as any).tracking_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-yellow-700 hover:underline flex items-center gap-1">
                          <Truck size={12} /> View tracking
                        </a>
                      )}
                      <div className="flex gap-2 pt-1">
                        {!(selectedOrder as any).awb_code && (
                          <button
                            onClick={() => handleSchedulePickup(selectedOrder.id)}
                            disabled={shiprocketLoading === selectedOrder.id}
                            className="flex-1 text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-1"
                          >
                            <Package size={12} /> Schedule Pickup
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelShiprocket(selectedOrder.id)}
                          disabled={shiprocketLoading === selectedOrder.id}
                          className="flex-1 text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-1"
                        >
                          <XCircle size={12} /> Cancel on SR
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 mb-3">Not pushed to Shiprocket yet</p>
                      <button
                        onClick={() => handlePushToShiprocket(selectedOrder.id)}
                        disabled={shiprocketLoading === selectedOrder.id || selectedOrder.status === 'cancelled'}
                        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {shiprocketLoading === selectedOrder.id
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Send size={14} />}
                        Push to Shiprocket
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>
              </div>

              {/* Shipping address */}
              {selectedOrder.shipping_address && (() => {
                const addr = getShippingAddress(selectedOrder);
                return addr ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</p>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <p className="font-semibold">{addr.name}</p>
                      <p>{addr.phone}</p>
                      <p>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Order total */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{parseFloat(String(selectedOrder.subtotal)).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-₹{parseFloat(String(selectedOrder.discount || 0)).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{parseFloat(String(selectedOrder.shipping_charge || 0)) === 0 ? 'Free' : `₹${parseFloat(String(selectedOrder.shipping_charge)).toLocaleString()}`}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-yellow-700">₹{parseFloat(String(selectedOrder.total)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
