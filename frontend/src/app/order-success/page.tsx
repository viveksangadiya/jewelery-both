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
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-white">
      <div className="max-w-lg w-full text-center">

        {/* Success mark */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#d4e3cb', border: '2px solid #347a07' }}>
          <CheckCircle size={40} style={{ color: '#347a07' }} />
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1c1c1c' }}>
          Order Placed!
        </h1>
        <p className="text-sm mb-8" style={{ color: '#363636' }}>
          {isCOD
            ? 'Your order is confirmed. Pay when it arrives at your door.'
            : 'Payment successful! Your order is being prepared with care.'}
        </p>

        {/* Order info */}
        <div className="p-6 text-left mb-5 space-y-3" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #e1e1e1' }}>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#9b9b9b' }}>Order Number</span>
            <span className="font-mono font-bold text-sm" style={{ color: '#1c1c1c' }}>{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #e1e1e1' }}>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#9b9b9b' }}>Total</span>
                <span className="font-bold text-sm" style={{ color: '#1c1c1c' }}>₹{parseFloat(String(order.total)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #e1e1e1' }}>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#9b9b9b' }}>Payment</span>
                <span className="text-sm font-semibold capitalize" style={{ color: '#1c1c1c' }}>
                  {isCOD ? 'Cash on Delivery' : `Paid via ${order.payment_method}`}
                </span>
              </div>
              {order.courier_name && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#9b9b9b' }}>Courier</span>
                  <span className="text-sm font-medium" style={{ color: '#1c1c1c' }}>{order.courier_name}</span>
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
                border: `1px solid ${done ? '#1c1c1c' : '#e1e1e1'}`,
                backgroundColor: done ? '#f5f5f5' : '#ffffff',
              }}>
              <Icon size={18} className="mx-auto mb-1.5" style={{ color: done ? '#1c1c1c' : '#e1e1e1' }} />
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase leading-tight"
                style={{ color: done ? '#1c1c1c' : '#9b9b9b' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Status note */}
        {order?.shipment_id ? (
          <div className="p-4 mb-5 text-sm" style={{ border: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
            <p className="font-bold text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: '#1c1c1c' }}>
              Handed to Courier
            </p>
            <p className="text-xs" style={{ color: '#363636' }}>
              Your order has been picked up by our courier partner and is on its way.
            </p>
          </div>
        ) : (
          <div className="p-4 mb-5 text-sm" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
            <p className="font-bold text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: '#1c1c1c' }}>
              Preparing Your Order
            </p>
            <p className="text-xs" style={{ color: '#363636' }}>
              We're handpacking your toran with care. Courier will be assigned shortly.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {orderNumber && (
            <Link
              href={`/track-order?order=${orderNumber}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ border: '1px solid #1c1c1c', color: '#1c1c1c', backgroundColor: 'transparent' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              <MapPin size={14} /> Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
            style={{ backgroundColor: '#1c1c1c', color: '#ffffff' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#363636')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1c1c1c')}
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
        </div>

        <p className="text-[10px] mt-5" style={{ color: '#9b9b9b' }}>
          Order confirmation sent to your registered email.{' '}
          <Link href="/contact" className="hover:underline" style={{ color: '#363636' }}>Contact us</Link> with any questions.
        </p>
      </div>
    </div>
  );
}
