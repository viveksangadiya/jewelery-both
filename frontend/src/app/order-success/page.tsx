'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
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
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success animation */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <CheckCircle size={52} className="text-green-500" />
        </div>

        <h1 className="font-display text-4xl font-bold text-charcoal mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 text-base mb-8">
          {isCOD
            ? 'Your order is confirmed. Pay when it arrives at your door.'
            : 'Payment successful! Your order is being processed.'}
        </p>

        {/* Order info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-left mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="font-mono font-bold text-yellow-700 text-sm">{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-gray-900">₹{parseFloat(String(order.total)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Payment</span>
                <span className={`text-sm font-semibold capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                  {isCOD ? 'Cash on Delivery' : `Paid via ${order.payment_method}`}
                </span>
              </div>
              {order.courier_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Courier</span>
                  <span className="text-sm font-medium text-gray-900">{order.courier_name}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: CheckCircle, label: 'Order Confirmed', done: true },
            { icon: Package, label: 'Being Packed', done: !!order?.shipment_id },
            { icon: Truck, label: 'Out for Delivery', done: false },
          ].map(({ icon: Icon, label, done }) => (
            <div key={label} className={`rounded-xl p-3 text-center border ${done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <Icon size={20} className={`mx-auto mb-1 ${done ? 'text-green-500' : 'text-gray-300'}`} />
              <p className={`text-xs font-medium ${done ? 'text-green-700' : 'text-gray-400'}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Shiprocket info */}
        {order?.shipment_id ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-700">
            <p className="font-semibold mb-1">📦 Handed to Shiprocket</p>
            <p className="text-xs text-blue-500">Your order has been picked up by our courier partner and is on its way.</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-6 text-sm text-yellow-700">
            <p className="font-semibold mb-1">⏳ Preparing your order</p>
            <p className="text-xs text-yellow-600">We're packing your jewelry. Courier will be assigned shortly.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {orderNumber && (
            <Link
              href={`/track-order?order=${orderNumber}`}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-yellow-500 text-yellow-700 font-semibold py-3 rounded-xl hover:bg-yellow-50 transition-colors text-sm"
            >
              <MapPin size={16} /> Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="flex-1 btn-gold flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Order confirmation sent to your registered email. Questions?{' '}
          <Link href="/contact" className="text-yellow-600 hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
