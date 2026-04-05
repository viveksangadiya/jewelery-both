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

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: any; step: number }> = {
  pending:    { label: 'Order Placed', bg: '#FFF8F5', color: '#B68868', icon: Clock,       step: 1 },
  confirmed:  { label: 'Confirmed',    bg: '#FAF9EE', color: '#642308', icon: CheckCircle, step: 2 },
  processing: { label: 'Processing',   bg: '#FAF9EE', color: '#903E1D', icon: RefreshCw,   step: 2 },
  shipped:    { label: 'Shipped',      bg: '#FAF9EE', color: '#642308', icon: Truck,       step: 3 },
  delivered:  { label: 'Delivered',    bg: '#EBEBCA', color: '#642308', icon: CheckCircle, step: 4 },
  cancelled:  { label: 'Cancelled',    bg: '#FFF0EE', color: '#b91c1c', icon: XCircle,     step: 0 },
  refunded:   { label: 'Refunded',     bg: '#EBEBCA', color: '#903E1D', icon: RefreshCw,   step: 0 },
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
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="h-8 w-48 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
        <div className="h-32 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
        <div className="h-48 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
        <div className="h-40 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="text-center">
        <Package size={40} className="mx-auto mb-4" style={{ color: '#EBEBCA' }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#642308' }}>Order not found</h2>
        <button
          onClick={() => router.push('/account')}
          className="px-6 py-2.5 mt-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
          style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}
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

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <button
          onClick={() => router.push('/account')}
          className="flex items-center gap-2 text-xs mb-6 transition-colors"
          style={{ color: '#903E1D' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
          onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}
        >
          <ArrowLeft size={14} /> Back to Account
        </button>

        {/* ── Header ─────────────────────────────── */}
        <div className="p-6 mb-4" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1" style={{ color: '#B68868' }}>Order Number</p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono" style={{ color: '#642308' }}>{order.order_number}</h1>
                <button
                  onClick={copyOrder}
                  className="p-1.5 transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EBEBCA')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {copied ? <CheckCircle size={14} style={{ color: '#642308' }} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#B68868' }}>
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
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #EBEBCA' }}>
              <div className="flex items-start justify-between relative">
                {/* Background line */}
                <div className="absolute top-4 left-4 right-4 h-px" style={{ backgroundColor: '#EBEBCA' }} />
                {/* Progress fill */}
                <div className="absolute top-4 left-4 h-px transition-all duration-500"
                  style={{
                    backgroundColor: '#642308',
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
                          backgroundColor: done ? '#642308' : active ? '#FAF9EE' : '#FAF9EE',
                          border: `2px solid ${done ? '#642308' : active ? '#642308' : '#EBEBCA'}`,
                          color: done ? '#FAF9EE' : active ? '#642308' : '#EBEBCA',
                        }}>
                        <StepIcon size={13} />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight"
                        style={{ color: done || active ? '#642308' : '#B68868' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #EBEBCA' }}>
              <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>
                This order has been {order.status}.
                {order.status === 'refunded' && ' Your refund will be processed in 5–7 business days.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Items ──────────────────────────────── */}
        <div className="p-6 mb-4" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#642308' }}>
            <Package size={15} style={{ color: '#B68868' }} />
            Items Ordered ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 py-3" style={{ borderBottom: '1px solid #EBEBCA' }}>
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#EBEBCA' }}>
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ color: '#B68868' }}><Package size={20} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#642308' }}>{item.product_name}</p>
                  {item.size_label && (
                    <p className="text-xs mt-0.5" style={{ color: '#903E1D' }}>Size: <span className="font-medium">{item.size_label}</span></p>
                  )}
                  {item.custom_text && (
                    <p className="text-xs mt-0.5" style={{ color: '#903E1D' }}>Note: <span className="italic font-medium">"{item.custom_text}"</span></p>
                  )}
                  <p className="text-xs mt-1" style={{ color: '#B68868' }}>Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm" style={{ color: '#642308' }}>₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#B68868' }}>₹{parseFloat(item.price).toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #EBEBCA' }}>
            <div className="flex justify-between text-sm" style={{ color: '#903E1D' }}>
              <span>Subtotal</span><span>₹{parseFloat(String(order.subtotal)).toLocaleString()}</span>
            </div>
            {parseFloat(String(order.discount)) > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#642308' }}>
                <span>Discount</span><span>−₹{parseFloat(String(order.discount)).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ color: '#903E1D' }}>
              <span>Shipping</span>
              <span>
                {parseFloat(String(order.shipping_charge)) === 0
                  ? <span className="font-semibold" style={{ color: '#642308' }}>Free</span>
                  : `₹${parseFloat(String(order.shipping_charge)).toLocaleString()}`
                }
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid #EBEBCA', color: '#642308' }}>
              <span>Total</span>
              <span>₹{parseFloat(String(order.total)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Address + Payment ──────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#642308' }}>
              <MapPin size={14} style={{ color: '#B68868' }} /> Delivery Address
            </h2>
            {address ? (
              <div className="text-xs space-y-1 leading-relaxed" style={{ color: '#903E1D' }}>
                <p className="font-semibold" style={{ color: '#642308' }}>{address.name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} – {address.pincode}</p>
                <p>{address.country || 'India'}</p>
                {address.phone && <p className="mt-2" style={{ color: '#B68868' }}>📞 {address.phone}</p>}
              </div>
            ) : <p className="text-xs" style={{ color: '#B68868' }}>Address not available</p>}
          </div>

          <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#642308' }}>
              <CreditCard size={14} style={{ color: '#B68868' }} /> Payment
            </h2>
            <div className="text-sm space-y-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#B68868' }}>Method</p>
                <p className="font-medium text-sm" style={{ color: '#642308' }}>{paymentLabel[order.payment_method || ''] || order.payment_method || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#B68868' }}>Status</p>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 capitalize"
                  style={{
                    backgroundColor: order.payment_status === 'paid' ? '#EBEBCA' : order.payment_status === 'failed' ? '#FFF0EE' : '#FFF8F5',
                    color: order.payment_status === 'paid' ? '#642308' : order.payment_status === 'failed' ? '#b91c1c' : '#B68868',
                  }}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ color: '#B68868' }}>Transaction ID</p>
                  <p className="font-mono text-xs break-all" style={{ color: '#903E1D' }}>{order.payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Track banner ────────────────────────── */}
        {order.status === 'shipped' && (
          <div className="p-5 flex items-center justify-between gap-4 mb-4"
            style={{ border: '1px solid #EBEBCA', backgroundColor: '#FAF9EE' }}>
            <div>
              <p className="font-semibold text-sm flex items-center gap-2" style={{ color: '#642308' }}>
                <Truck size={15} /> Your order is on the way!
              </p>
              <p className="text-xs mt-1" style={{ color: '#903E1D' }}>Track your shipment for live updates</p>
            </div>
            <a
              href={`/track-order?order=${order.order_number}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#903E1D')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#642308')}
            >
              Track <ExternalLink size={12} />
            </a>
          </div>
        )}

        {order.notes && (
          <div className="p-5" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
            <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1.5" style={{ color: '#B68868' }}>Order Notes</p>
            <p className="text-sm italic" style={{ fontFamily: 'Georgia, serif', color: '#903E1D' }}>"{order.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
