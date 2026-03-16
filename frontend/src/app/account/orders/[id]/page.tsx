'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: any; step: number }> = {
  pending:    { label: 'Order Placed', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock,       step: 1 },
  confirmed:  { label: 'Confirmed',    color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: CheckCircle, step: 2 },
  processing: { label: 'Processing',   color: 'text-purple-600 bg-purple-50 border-purple-200', icon: RefreshCw,   step: 2 },
  shipped:    { label: 'Shipped',      color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck,       step: 3 },
  delivered:  { label: 'Delivered',    color: 'text-green-600 bg-green-50 border-green-200',    icon: CheckCircle, step: 4 },
  cancelled:  { label: 'Cancelled',    color: 'text-red-600 bg-red-50 border-red-200',          icon: XCircle,     step: 0 },
  refunded:   { label: 'Refunded',     color: 'text-gray-600 bg-gray-50 border-gray-200',       icon: RefreshCw,   step: 0 },
};

const paymentLabel: Record<string, string> = {
  razorpay: 'Online Payment (Razorpay)',
  cod: 'Cash on Delivery',
  upi: 'UPI',
};

const steps = [
  { label: 'Order Placed', icon: Clock },
  { label: 'Confirmed',    icon: CheckCircle },
  { label: 'Shipped',      icon: Truck },
  { label: 'Delivered',    icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
    ordersApi.getById(Number(params.id))
      .then(r => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id, user]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="skeleton h-8 rounded w-48" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Order not found</h2>
        <button onClick={() => router.push('/account')} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-medium mt-4">
          Back to Account
        </button>
      </div>
    </div>
  );

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const address = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address) : order.shipping_address;

  const copyOrder = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <button onClick={() => router.push('/account')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Account
        </button>

        {/* ── Header ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order Number</p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 font-mono">{order.order_number}</h1>
                <button onClick={copyOrder} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  {copied ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${status.color}`}>
              <StatusIcon size={16} /> {status.label}
            </span>
          </div>

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
                <div className="absolute top-4 left-4 h-0.5 bg-yellow-400 transition-all duration-500"
                  style={{ width: `calc(${((status.step - 1) / (steps.length - 1)) * 100}% - 2rem)` }} />
                {steps.map((step, i) => {
                  const done = status.step > i + 1;
                  const active = status.step === i + 1;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-2 z-10 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done ? 'bg-yellow-500 border-yellow-500 text-white' :
                        active ? 'bg-white border-yellow-500 text-yellow-600' :
                        'bg-white border-gray-200 text-gray-300'}`}>
                        <StepIcon size={14} />
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight ${done || active ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-red-500 font-medium">
                This order has been {order.status}.
                {order.status === 'refunded' && ' Your refund will be processed in 5-7 business days.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Items ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={17} className="text-yellow-600" />
            Items Ordered ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={22} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                  {item.size_label && (
                    <p className="text-xs text-gray-500 mt-0.5">Size: <span className="font-medium">{item.size_label}</span></p>
                  )}
                  {item.custom_text && (
                    <p className="text-xs text-gray-500 mt-0.5">Engraving: <span className="italic font-medium">"{item.custom_text}"</span></p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">₹{parseFloat(item.price).toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>₹{parseFloat(String(order.subtotal)).toLocaleString()}</span>
            </div>
            {parseFloat(String(order.discount)) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span><span>−₹{parseFloat(String(order.discount)).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{parseFloat(String(order.shipping_charge)) === 0
                ? <span className="text-green-600 font-medium">Free</span>
                : `₹${parseFloat(String(order.shipping_charge)).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-yellow-700">₹{parseFloat(String(order.total)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Address + Payment ──────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={17} className="text-yellow-600" /> Delivery Address
            </h2>
            {address ? (
              <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
                <p className="font-semibold text-gray-900">{address.name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} – {address.pincode}</p>
                <p>{address.country || 'India'}</p>
                {address.phone && <p className="text-gray-500 mt-2">📞 {address.phone}</p>}
              </div>
            ) : <p className="text-sm text-gray-400">Address not available</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={17} className="text-yellow-600" /> Payment
            </h2>
            <div className="text-sm space-y-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-0.5">Method</p>
                <p className="text-gray-800 font-medium">{paymentLabel[order.payment_method || ''] || order.payment_method || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-0.5">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                  order.payment_status === 'paid'   ? 'bg-green-100 text-green-700' :
                  order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-0.5">Transaction ID</p>
                  <p className="text-gray-600 font-mono text-xs break-all">{order.payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Track banner ───────────────────────────── */}
        {order.status === 'shipped' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="font-semibold text-indigo-800 flex items-center gap-2"><Truck size={16} /> Your order is on the way!</p>
              <p className="text-sm text-indigo-600 mt-1">Track your shipment for live updates</p>
            </div>
            <a href={`/track-order?order=${order.order_number}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Track <ExternalLink size={14} />
            </a>
          </div>
        )}

        {order.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order Notes</p>
            <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
