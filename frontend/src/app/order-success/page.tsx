'use client';
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
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-lg w-full text-center">

        {/* Success mark */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#EBEBCA', border: '2px solid #B68868' }}>
          <CheckCircle size={40} style={{ color: '#642308' }} />
        </div>

        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
          Order Placed!
        </h1>
        <p className="text-sm mb-8" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          {isCOD
            ? 'Your order is confirmed. Pay when it arrives at your door.'
            : 'Payment successful! Your order is being prepared with care.'}
        </p>

        {/* Order info */}
        <div className="p-6 text-left mb-5 space-y-3" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #EBEBCA' }}>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#B68868' }}>Order Number</span>
            <span className="font-mono font-bold text-sm" style={{ color: '#642308' }}>{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #EBEBCA' }}>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#B68868' }}>Total</span>
                <span className="font-bold text-sm" style={{ color: '#642308' }}>₹{parseFloat(String(order.total)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #EBEBCA' }}>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#B68868' }}>Payment</span>
                <span className="text-sm font-semibold capitalize" style={{ color: '#642308' }}>
                  {isCOD ? 'Cash on Delivery' : `Paid via ${order.payment_method}`}
                </span>
              </div>
              {order.courier_name && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#B68868' }}>Courier</span>
                  <span className="text-sm font-medium" style={{ color: '#642308' }}>{order.courier_name}</span>
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
                border: `1px solid ${done ? '#B68868' : '#EBEBCA'}`,
                backgroundColor: done ? '#EBEBCA' : '#ffffff',
              }}>
              <Icon size={18} className="mx-auto mb-1.5" style={{ color: done ? '#642308' : '#EBEBCA' }} />
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase leading-tight"
                style={{ color: done ? '#642308' : '#B68868' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Status note */}
        {order?.shipment_id ? (
          <div className="p-4 mb-5 text-sm" style={{ border: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
            <p className="font-bold text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: '#642308' }}>
              Handed to Courier
            </p>
            <p className="text-xs" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              Your order has been picked up by our courier partner and is on its way.
            </p>
          </div>
        ) : (
          <div className="p-4 mb-5 text-sm" style={{ border: '1px solid #EBEBCA', backgroundColor: '#FAF9EE' }}>
            <p className="font-bold text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: '#642308' }}>
              Preparing Your Order
            </p>
            <p className="text-xs" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
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
              style={{ border: '1px solid #642308', color: '#642308', backgroundColor: 'transparent' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#EBEBCA')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              <MapPin size={14} /> Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
            style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#903E1D')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#642308')}
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
        </div>

        <p className="text-[10px] mt-5" style={{ color: '#B68868' }}>
          Order confirmation sent to your registered email.{' '}
          <Link href="/contact" className="hover:underline" style={{ color: '#903E1D' }}>Contact us</Link> with any questions.
        </p>
      </div>
    </div>
  );
}
