'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

interface OrderData {
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipment_id?: string;
  courier_name?: string;
}

export default function OrderSuccessPage(): JSX.Element {
  const params = useSearchParams();
  const orderNumber = params.get('order');
  const method = params.get('method');
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/shiprocket/track/${orderNumber}`)
        .then((r) => setOrder(r.data.data))
        .catch(console.error);
    }
  }, [orderNumber]);

  const isCOD = method === 'cod' || order?.payment_method === 'cod';

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-brand-bg">
      <div className="max-w-lg w-full text-center">

        {/* Success mark */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-green-50 border-2 border-green-300">
          <CheckCircle size={40} className="text-green-700" />
        </div>

        <h1 className="font-display text-3xl font-semibold mb-2 text-brand-text">
          Order Placed!
        </h1>
        <p className="text-sm mb-8 text-brand-secondary">
          {isCOD
            ? 'Your order is confirmed. Pay when it arrives at your door.'
            : 'Payment successful! Your order is being prepared with care.'}
        </p>

        {/* Order info */}
        <div className="p-6 text-left mb-5 space-y-3 bg-white border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-brand-muted">Order Number</span>
            <span className="font-mono font-bold text-sm text-brand-text">{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-brand-border">
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-brand-muted">Total</span>
                <span className="font-bold text-sm text-brand-text">₹{parseFloat(String(order.total)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-brand-border">
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-brand-muted">Payment</span>
                <span className="text-sm font-semibold capitalize text-brand-text">
                  {isCOD ? 'Cash on Delivery' : `Paid via ${order.payment_method}`}
                </span>
              </div>
              {order.courier_name && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-brand-muted">Courier</span>
                  <span className="text-sm font-medium text-brand-text">{order.courier_name}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: CheckCircle, label: 'Order Confirmed', done: true },
            { icon: Package,     label: 'Being Packed',    done: !!order?.shipment_id },
            { icon: Truck,       label: 'Out for Delivery', done: false },
          ].map(({ icon: Icon, label, done }) => (
            <div key={label} className="p-3 text-center"
              style={{
                border: `1px solid ${done ? '#000' : '#E0D9D0'}`,
                backgroundColor: done ? '#EDE8E2' : '#fff',
              }}>
              <Icon size={18} className="mx-auto mb-1.5"
                style={{ color: done ? '#000' : '#E0D9D0' }} />
              <p className="text-[10px] font-medium tracking-[0.1em] uppercase leading-tight"
                style={{ color: done ? '#000' : '#999' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Status note */}
        {order?.shipment_id ? (
          <div className="p-4 mb-5 text-sm bg-brand-hover border border-brand-border">
            <p className="font-medium text-[11px] tracking-[0.15em] uppercase mb-1 text-brand-text">
              Handed to Courier
            </p>
            <p className="text-xs text-brand-secondary">
              Your order has been picked up by our courier partner and is on its way.
            </p>
          </div>
        ) : (
          <div className="p-4 mb-5 text-sm bg-white border border-brand-border">
            <p className="font-medium text-[11px] tracking-[0.15em] uppercase mb-1 text-brand-text">
              Preparing Your Order
            </p>
            <p className="text-xs text-brand-secondary">
              We're handpacking your toran with care. Courier will be assigned shortly.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {orderNumber && (
            <Link
              href={`/track-order?order=${orderNumber}`}
              className="btn-brand-outline flex-1 h-12 inline-flex items-center justify-center gap-2"
            >
              <MapPin size={14} /> Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="btn-brand flex-1 h-12 inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
        </div>

        <p className="text-[10px] mt-5 text-brand-muted">
          Order confirmation sent to your registered email.{' '}
          <Link href="/contact" className="hover:underline text-brand-secondary">Contact us</Link> with any questions.
        </p>
      </div>
    </div>
  );
}
