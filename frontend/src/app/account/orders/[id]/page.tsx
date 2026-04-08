'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: any; step: number }> = {
  pending:    { label: 'Order Placed', bg: '#f5f5f5',  color: '#9b9b9b', icon: Clock,       step: 1 },
  confirmed:  { label: 'Confirmed',    bg: '#f5f5f5',  color: '#1c1c1c', icon: CheckCircle, step: 2 },
  processing: { label: 'Processing',   bg: '#f5f5f5',  color: '#363636', icon: RefreshCw,   step: 2 },
  shipped:    { label: 'Shipped',      bg: '#f5f5f5',  color: '#1c1c1c', icon: Truck,       step: 3 },
  delivered:  { label: 'Delivered',    bg: '#d4e3cb', color: '#347a07', icon: CheckCircle, step: 4 },
  cancelled:  { label: 'Cancelled',    bg: '#fff0f0', color: '#e32c2b', icon: XCircle,     step: 0 },
  refunded:   { label: 'Refunded',     bg: '#f5f5f5',  color: '#363636', icon: RefreshCw,   step: 0 },
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
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
    ordersApi.getById(Number(params.id))
      .then(r => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id, user]);

  if (loading) return (
    <div className="min-h-screen py-10 bg-white">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="h-8 w-48 animate-pulse" style={{ backgroundColor: '#f5f5f5' }} />
        <div className="h-32 animate-pulse" style={{ backgroundColor: '#f5f5f5' }} />
        <div className="h-48 animate-pulse" style={{ backgroundColor: '#f5f5f5' }} />
        <div className="h-40 animate-pulse" style={{ backgroundColor: '#f5f5f5' }} />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Package size={40} className="mx-auto mb-4" style={{ color: '#e1e1e1' }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#1c1c1c' }}>Order not found</h2>
        <button
          onClick={() => router.push('/account')}
          className="btn-craft px-6 mt-4"
        >
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

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success('Order cancelled successfully');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen py-10 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <button
          onClick={() => router.push('/account')}
          className="flex items-center gap-2 text-xs mb-6 transition-colors"
          style={{ color: '#9b9b9b' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1c1c1c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9b9b9b')}
        >
          <ArrowLeft size={14} /> Back to Account
        </button>

        {/* ── Header ─────────────────────────────── */}
        <div className="p-6 mb-4" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1" style={{ color: '#9b9b9b' }}>Order Number</p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono" style={{ color: '#1c1c1c' }}>{order.order_number}</h1>
                <button
                  onClick={copyOrder}
                  className="p-1.5 transition-colors"
                  style={{ color: '#9b9b9b' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {copied ? <CheckCircle size={14} style={{ color: '#347a07' }} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#9b9b9b' }}>
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.bg}` }}>
              <StatusIcon size={13} /> {status.label}
            </span>
          </div>

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e1e1e1' }}>
              <div className="flex items-start justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-px" style={{ backgroundColor: '#e1e1e1' }} />
                <div className="absolute top-4 left-4 h-px transition-all duration-500"
                  style={{
                    backgroundColor: '#1c1c1c',
                    width: `calc(${((status.step - 1) / (steps.length - 1)) * 100}% - 2rem)`,
                  }} />
                {steps.map((step, i) => {
                  const done = status.step > i + 1;
                  const active = status.step === i + 1;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-2 z-10 flex-1">
                      <div className="w-8 h-8 flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: done ? '#1c1c1c' : '#ffffff',
                          border: `2px solid ${done ? '#1c1c1c' : active ? '#1c1c1c' : '#e1e1e1'}`,
                          color: done ? '#ffffff' : active ? '#1c1c1c' : '#e1e1e1',
                        }}>
                        <StepIcon size={13} />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight"
                        style={{ color: done || active ? '#1c1c1c' : '#9b9b9b' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e1e1e1' }}>
              <p className="text-sm font-medium" style={{ color: '#e32c2b' }}>
                This order has been {order.status}.
                {order.status === 'refunded' && ' Your refund will be processed in 5–7 business days.'}
              </p>
            </div>
          )}

          {canCancel && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e1e1e1' }}>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 transition-colors disabled:opacity-50"
                style={{ border: '1px solid #f5c6c6', color: '#e32c2b' }}
                onMouseEnter={e => { if (!cancelling) (e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
              <p className="text-[10px] mt-2" style={{ color: '#9b9b9b' }}>Orders can be cancelled before they are shipped.</p>
            </div>
          )}
        </div>

        {/* ── Items ──────────────────────────────── */}
        <div className="p-6 mb-4" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1c1c1c' }}>
            <Package size={15} style={{ color: '#9b9b9b' }} />
            Items Ordered ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 py-3" style={{ borderBottom: '1px solid #e1e1e1' }}>
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ color: '#9b9b9b' }}><Package size={20} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#1c1c1c' }}>{item.product_name}</p>
                  {item.size_label && (
                    <p className="text-xs mt-0.5" style={{ color: '#363636' }}>Size: <span className="font-medium">{item.size_label}</span></p>
                  )}
                  {item.custom_text && (
                    <p className="text-xs mt-0.5" style={{ color: '#363636' }}>Note: <span className="font-medium">"{item.custom_text}"</span></p>
                  )}
                  <p className="text-xs mt-1" style={{ color: '#9b9b9b' }}>Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm" style={{ color: '#1c1c1c' }}>₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#9b9b9b' }}>₹{parseFloat(item.price).toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #e1e1e1' }}>
            <div className="flex justify-between text-sm" style={{ color: '#363636' }}>
              <span>Subtotal</span><span>₹{parseFloat(String(order.subtotal)).toLocaleString()}</span>
            </div>
            {parseFloat(String(order.discount)) > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#1c1c1c' }}>
                <span>Discount</span><span>−₹{parseFloat(String(order.discount)).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ color: '#363636' }}>
              <span>Shipping</span>
              <span>
                {parseFloat(String(order.shipping_charge)) === 0
                  ? <span className="font-semibold" style={{ color: '#347a07' }}>Free</span>
                  : `₹${parseFloat(String(order.shipping_charge)).toLocaleString()}`
                }
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid #e1e1e1', color: '#1c1c1c' }}>
              <span>Total</span>
              <span>₹{parseFloat(String(order.total)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Address + Payment ──────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1c1c1c' }}>
              <MapPin size={14} style={{ color: '#9b9b9b' }} /> Delivery Address
            </h2>
            {address ? (
              <div className="text-xs space-y-1 leading-relaxed" style={{ color: '#363636' }}>
                <p className="font-semibold" style={{ color: '#1c1c1c' }}>{address.name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} – {address.pincode}</p>
                <p>{address.country || 'India'}</p>
                {address.phone && <p className="mt-2" style={{ color: '#9b9b9b' }}>📞 {address.phone}</p>}
              </div>
            ) : <p className="text-xs" style={{ color: '#9b9b9b' }}>Address not available</p>}
          </div>

          <div className="p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1c1c1c' }}>
              <CreditCard size={14} style={{ color: '#9b9b9b' }} /> Payment
            </h2>
            <div className="text-sm space-y-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#9b9b9b' }}>Method</p>
                <p className="font-medium text-sm" style={{ color: '#1c1c1c' }}>{paymentLabel[order.payment_method || ''] || order.payment_method || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#9b9b9b' }}>Status</p>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 capitalize"
                  style={{
                    backgroundColor: order.payment_status === 'paid' ? '#d4e3cb' : order.payment_status === 'failed' ? '#fff0f0' : '#f5f5f5',
                    color: order.payment_status === 'paid' ? '#347a07' : order.payment_status === 'failed' ? '#e32c2b' : '#9b9b9b',
                  }}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#9b9b9b' }}>Transaction ID</p>
                  <p className="font-mono text-xs break-all" style={{ color: '#363636' }}>{order.payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Track banner ────────────────────────── */}
        {order.status === 'shipped' && (
          <div className="p-5 flex items-center justify-between gap-4 mb-4"
            style={{ border: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
            <div>
              <p className="font-semibold text-sm flex items-center gap-2" style={{ color: '#1c1c1c' }}>
                <Truck size={15} /> Your order is on the way!
              </p>
              <p className="text-xs mt-1" style={{ color: '#363636' }}>Track your shipment for live updates</p>
            </div>
            <a
              href={`/track-order?order=${order.order_number}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
              style={{ backgroundColor: '#1c1c1c', color: '#ffffff' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#363636')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1c1c1c')}
            >
              Track <ExternalLink size={12} />
            </a>
          </div>
        )}

        {order.notes && (
          <div className="p-5" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
            <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1.5" style={{ color: '#9b9b9b' }}>Order Notes</p>
            <p className="text-sm" style={{ color: '#363636' }}>"{order.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
