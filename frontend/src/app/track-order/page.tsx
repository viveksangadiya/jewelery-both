'use client';
import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import type { OrderStatus } from '@/types';

interface TrackingStep {
  label: string;
  done: boolean;
  active: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface TrackingData {
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  created_at: string;
  awb_code?: string;
  courier_name?: string;
  tracking_url?: string;
  tracking?: {
    tracking_data?: {
      shipment_track?: Array<{
        current_status: string;
        delivered_date?: string;
        eta?: string;
      }>;
      shipment_track_activities?: Array<{
        date: string;
        activity: string;
        location: string;
        sr_status_label: string;
      }>;
    };
  };
}

const statusSteps: { key: OrderStatus; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'pending',    label: 'Order Placed',    icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',       icon: CheckCircle },
  { key: 'processing', label: 'Processing',      icon: Package },
  { key: 'shipped',    label: 'Shipped',         icon: Truck },
  { key: 'delivered',  label: 'Delivered',       icon: CheckCircle },
];

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function TrackOrderPage(): JSX.Element {
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string>('');

  const handleTrack = async (): Promise<void> => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setTracking(null);
    try {
      const res = await api.get(`/shiprocket/track/${orderNumber.trim()}`);
      setTracking(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found. Please check the order number.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = tracking
    ? statusOrder.indexOf(tracking.status as OrderStatus)
    : -1;

  const isCancelled = tracking?.status === 'cancelled' || tracking?.status === 'refunded';

  const activities = tracking?.tracking?.tracking_data?.shipment_track_activities || [];
  const shipmentInfo = tracking?.tracking?.tracking_data?.shipment_track?.[0];

  return (
    <div className="min-h-screen bg-cream py-14">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={30} className="text-yellow-600" />
          </div>
          <h1 className="font-display text-4xl font-bold text-charcoal mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number to get live shipping updates</p>
        </div>

        {/* Search box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Order Number</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. JWL-ABC123-XY"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors font-mono"
            />
            <button
              onClick={handleTrack}
              disabled={loading || !orderNumber.trim()}
              className="btn-gold px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Search size={16} />}
              Track
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
              <XCircle size={15} /> {error}
            </p>
          )}
        </div>

        {/* Tracking result */}
        {tracking && (
          <div className="space-y-5 animate-fade-in">
            {/* Order summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Order Number</p>
                  <p className="font-mono font-bold text-lg text-gray-900">{tracking.order_number}</p>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize border ${
                  isCancelled ? 'bg-red-100 text-red-700 border-red-200' :
                  tracking.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                  {tracking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(tracking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                  <p className={`font-medium capitalize ${tracking.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                    {tracking.payment_status}
                  </p>
                </div>
                {tracking.courier_name && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Courier</p>
                    <p className="font-medium text-gray-800">{tracking.courier_name}</p>
                  </div>
                )}
                {tracking.awb_code && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">AWB Number</p>
                    <p className="font-mono font-medium text-gray-800">{tracking.awb_code}</p>
                  </div>
                )}
              </div>

              {tracking.tracking_url && (
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-yellow-700 font-medium hover:underline"
                >
                  <ExternalLink size={14} /> Track on courier website
                </a>
              )}

              {shipmentInfo?.eta && (
                <div className="mt-4 bg-yellow-50 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-yellow-800">
                  <Clock size={15} className="text-yellow-600" />
                  <span>Estimated delivery: <strong>{shipmentInfo.eta}</strong></span>
                </div>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6">Shipment Progress</h3>
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-yellow-400 transition-all duration-500"
                    style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%' }}
                  />
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, idx) => {
                      const done = idx <= currentStepIndex;
                      const active = idx === currentStepIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                            done
                              ? 'bg-yellow-500 border-yellow-500 text-white'
                              : 'bg-white border-gray-200 text-gray-300'
                          } ${active ? 'ring-4 ring-yellow-100' : ''}`}>
                            <Icon size={16} />
                          </div>
                          <p className={`text-xs font-medium text-center leading-tight ${done ? 'text-yellow-700' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Live activity timeline */}
            {activities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-5">Tracking Activity</h3>
                <div className="space-y-4">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${idx === 0 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                        {idx < activities.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className={`text-sm font-semibold ${idx === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                          {activity.sr_status_label || activity.activity}
                        </p>
                        {activity.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {activity.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No live tracking yet */}
            {!tracking.shipment_id && !isCancelled && (
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-center">
                <Package size={32} className="mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-blue-700 font-medium">Your order is being prepared</p>
                <p className="text-xs text-blue-500 mt-1">Live tracking will be available once your order is shipped</p>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Can't find your order? <a href="/contact" className="text-yellow-600 hover:underline">Contact us</a> for help.
        </p>
      </div>
    </div>
  );
}
