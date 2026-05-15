'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, RefreshCw, Copy, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: any; step: number }> = {
  pending:    { label: 'Order Placed', bg: '#F5F0EB', color: '#999',    icon: Clock,        step: 1 },
  confirmed:  { label: 'Confirmed',   bg: '#F5F0EB', color: '#000',    icon: CheckCircle,  step: 2 },
  processing: { label: 'Processing',  bg: '#F5F0EB', color: '#6B6B6B', icon: RefreshCw,    step: 2 },
  shipped:    { label: 'Shipped',     bg: '#000',    color: '#fff',    icon: Truck,        step: 3 },
  delivered:  { label: 'Delivered',   bg: '#000',    color: '#fff',    icon: CheckCircle,  step: 4 },
  cancelled:  { label: 'Cancelled',   bg: '#fff0f0', color: '#b91c1c', icon: XCircle,      step: 0 },
  refunded:   { label: 'Refunded',    bg: '#F5F0EB', color: '#6B6B6B', icon: RefreshCw,    step: 0 },
};

const paymentLabel: Record<string, string> = {
  razorpay: 'Online Payment (Razorpay)',
  cod: 'Cash on Delivery',
  upi: 'UPI',
};

const STEPS = [
  { label: 'Order Placed', icon: Clock       },
  { label: 'Confirmed',    icon: CheckCircle },
  { label: 'Shipped',      icon: Truck       },
  { label: 'Delivered',    icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user   = useAuthStore(s => s.user);

  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
    ordersApi.getById(Number(params.id))
      .then(r => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id, user]);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="h-5 skeleton w-36 rounded" />
        <div className="h-40 skeleton" />
        <div className="h-48 skeleton" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="text-center">
        <Package size={36} className="text-brand-border mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-xl text-brand-text mb-2">Order not found</h2>
        <Link href="/account" className="btn-brand px-8 h-11 mt-4 inline-flex">
          Back to Account
        </Link>
      </div>
    </div>
  );

  const status     = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const canCancel   = ['pending', 'confirmed'].includes(order.status);
  const address     = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address;

  const copyOrder = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success('Order cancelled successfully');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally { setCancelling(false); }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Account
        </Link>

        {/* ── Order header ── */}
        <div className="bg-white border border-brand-border px-6 py-6 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted mb-1">Order Number</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-mono font-medium text-brand-text">{order.order_number}</h1>
                <button
                  onClick={copyOrder}
                  className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-hover transition-colors"
                  title="Copy order number"
                >
                  {copied
                    ? <CheckCircle size={13} className="text-green-700" />
                    : <Copy size={13} />
                  }
                </button>
              </div>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              <StatusIcon size={12} /> {status.label}
            </span>
          </div>

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="border-t border-brand-border pt-5">
              <div className="flex items-start justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-px bg-brand-border" />
                <div
                  className="absolute top-4 left-4 h-px bg-brand-text transition-all duration-500"
                  style={{ width: `calc(${((status.step - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }}
                />
                {STEPS.map((s, i) => {
                  const done   = status.step > i + 1;
                  const active = status.step === i + 1;
                  const Icon   = s.icon;
                  return (
                    <div key={s.label} className="flex flex-col items-center gap-2 z-10 flex-1">
                      <div
                        className="w-8 h-8 flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: done ? '#000' : '#fff',
                          border: `2px solid ${done ? '#000' : active ? '#000' : '#E0D9D0'}`,
                          color: done ? '#fff' : active ? '#000' : '#E0D9D0',
                        }}
                      >
                        <Icon size={13} />
                      </div>
                      <span
                        className="text-[9px] font-medium text-center leading-tight tracking-[0.05em] uppercase"
                        style={{ color: done || active ? '#000' : '#999' }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="border-t border-brand-border pt-4 mt-1">
              <p className="text-sm text-red-600 font-medium">
                This order has been {order.status}.
                {order.status === 'refunded' && ' Your refund will be processed in 5–7 business days.'}
              </p>
            </div>
          )}

          {canCancel && (
            <div className="border-t border-brand-border pt-4 mt-4 flex items-center justify-between">
              <p className="text-[11px] text-brand-muted">Orders can be cancelled before they are shipped.</p>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

        {/* ── Items ── */}
        <div className="bg-white border border-brand-border px-6 py-6 mb-4">
          <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text mb-5 flex items-center gap-2">
            <Package size={13} className="text-brand-muted" />
            Items Ordered ({order.items?.length || 0})
          </h2>
          <div className="space-y-0">
            {order.items?.map((item: any, idx: number) => (
              <div
                key={item.id}
                className="flex gap-4 py-4"
                style={{ borderBottom: idx < (order.items?.length ?? 0) - 1 ? '1px solid #E0D9D0' : 'none' }}
              >
                <div className="w-16 h-20 flex-shrink-0 bg-brand-hover overflow-hidden">
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-brand-muted" />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-text">{item.product_name}</p>
                  {item.size_label && (
                    <p className="text-[11px] text-brand-muted mt-0.5">Size: {item.size_label}</p>
                  )}
                  {item.custom_text && (
                    <p className="text-[11px] text-brand-muted mt-0.5">Note: "{item.custom_text}"</p>
                  )}
                  <p className="text-[11px] text-brand-muted mt-0.5">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-brand-text">
                    ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-brand-muted mt-0.5">
                    ₹{parseFloat(item.price).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="border-t border-brand-border pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm text-brand-secondary">
              <span>Subtotal</span>
              <span>₹{parseFloat(String(order.subtotal)).toLocaleString('en-IN')}</span>
            </div>
            {parseFloat(String(order.discount)) > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>−₹{parseFloat(String(order.discount)).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-brand-secondary">
              <span>Shipping</span>
              <span>
                {parseFloat(String(order.shipping_charge)) === 0
                  ? <span className="text-green-700 font-medium">Free</span>
                  : `₹${parseFloat(String(order.shipping_charge)).toLocaleString('en-IN')}`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-brand-text border-t border-brand-border pt-3 mt-1">
              <span className="text-[10px] tracking-[0.15em] uppercase">Total</span>
              <span className="text-base">₹{parseFloat(String(order.total)).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* ── Address + Payment ── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-brand-border px-6 py-5">
            <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text mb-4 flex items-center gap-2">
              <MapPin size={13} className="text-brand-muted" /> Delivery Address
            </h2>
            {address ? (
              <div className="text-xs space-y-1 leading-relaxed text-brand-secondary">
                <p className="font-medium text-brand-text">{address.name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} – {address.pincode}</p>
                <p>{address.country || 'India'}</p>
                {address.phone && <p className="mt-2 text-brand-muted">{address.phone}</p>}
              </div>
            ) : (
              <p className="text-xs text-brand-muted">Address not available</p>
            )}
          </div>

          <div className="bg-white border border-brand-border px-6 py-5">
            <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text mb-4 flex items-center gap-2">
              <CreditCard size={13} className="text-brand-muted" /> Payment
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-1">Method</p>
                <p className="text-sm font-medium text-brand-text">
                  {paymentLabel[order.payment_method || ''] || order.payment_method || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-1">Status</p>
                <span
                  className="text-[9px] font-medium tracking-[0.1em] uppercase px-2.5 py-1 capitalize"
                  style={{
                    backgroundColor: order.payment_status === 'paid' ? '#000' : order.payment_status === 'failed' ? '#fff0f0' : '#F5F0EB',
                    color: order.payment_status === 'paid' ? '#fff' : order.payment_status === 'failed' ? '#b91c1c' : '#999',
                  }}
                >
                  {order.payment_status}
                </span>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-1">Transaction ID</p>
                  <p className="font-mono text-[11px] break-all text-brand-secondary">{order.payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track banner */}
        {order.status === 'shipped' && (
          <div className="bg-white border border-brand-border px-5 py-4 flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-brand-text flex items-center gap-2">
                <Truck size={14} /> Your order is on its way
              </p>
              <p className="text-[11px] text-brand-muted mt-0.5">Track your shipment for live updates</p>
            </div>
            <a
              href={`/track-order?order=${order.order_number}`}
              className="btn-brand h-10 px-5 text-[10px] flex-shrink-0"
            >
              Track <ExternalLink size={11} />
            </a>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-white border border-brand-border px-6 py-5">
            <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted mb-2">Order Notes</p>
            <p className="text-sm text-brand-secondary">"{order.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
