'use client';
export const dynamic = 'force-dynamic';
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
  shipment_id?: string;
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

const statusSteps: { key: OrderStatus; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'pending',    label: 'Order Placed', icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',    icon: CheckCircle },
  { key: 'processing', label: 'Processing',   icon: Package },
  { key: 'shipped',    label: 'Shipped',      icon: Truck },
  { key: 'delivered',  label: 'Delivered',    icon: CheckCircle },
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
    <div className="min-h-screen py-14 bg-white">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#f5f5f5', border: '1px solid #e1e1e1' }}>
            <Truck size={28} style={{ color: '#1c1c1c' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1c1c1c' }}>
            Track Your Order
          </h1>
          <p className="text-sm" style={{ color: '#363636' }}>
            Enter your order number to get live shipping updates
          </p>
        </div>

        {/* Search box */}
        <div className="p-6 mb-5" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: '#9b9b9b' }}>Order Number</p>
          <div className="flex gap-0">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. HK-ABC123-XY"
              className="flex-1 px-4 py-3 text-sm outline-none font-mono transition-colors"
              style={{ border: '1px solid #e1e1e1', borderRight: 'none', color: '#1c1c1c', backgroundColor: '#ffffff' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1c1c1c')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e1e1e1')}
            />
            <button
              onClick={handleTrack}
              disabled={loading || !orderNumber.trim()}
              className="px-5 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 flex-shrink-0 transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1c1c1c', color: '#ffffff' }}
              onMouseEnter={e => { if (!loading && orderNumber.trim()) (e.currentTarget.style.backgroundColor = '#363636'); }}
              onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#1c1c1c'); }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Search size={14} />}
              Track
            </button>
          </div>
          {error && (
            <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: '#e32c2b' }}>
              <XCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Tracking result */}
        {tracking && (
          <div className="space-y-4">

            {/* Order summary */}
            <div className="p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1" style={{ color: '#9b9b9b' }}>Order Number</p>
                  <p className="font-mono font-bold text-lg" style={{ color: '#1c1c1c' }}>{tracking.order_number}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 font-bold tracking-[0.15em] uppercase capitalize"
                  style={{
                    backgroundColor: isCancelled ? '#fff0f0' : tracking.status === 'delivered' ? '#d4e3cb' : '#f5f5f5',
                    color: isCancelled ? '#e32c2b' : '#1c1c1c',
                    border: `1px solid ${isCancelled ? '#f5c6c6' : '#e1e1e1'}`,
                  }}>
                  {tracking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div style={{ borderBottom: '1px solid #e1e1e1', paddingBottom: '0.75rem' }}>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#9b9b9b' }}>Order Date</p>
                  <p className="font-medium text-sm" style={{ color: '#1c1c1c' }}>
                    {new Date(tracking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ borderBottom: '1px solid #e1e1e1', paddingBottom: '0.75rem' }}>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#9b9b9b' }}>Payment</p>
                  <p className="font-medium text-sm capitalize" style={{ color: tracking.payment_status === 'paid' ? '#347a07' : '#9b9b9b' }}>
                    {tracking.payment_status}
                  </p>
                </div>
                {tracking.courier_name && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#9b9b9b' }}>Courier</p>
                    <p className="font-medium text-sm" style={{ color: '#1c1c1c' }}>{tracking.courier_name}</p>
                  </div>
                )}
                {tracking.awb_code && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#9b9b9b' }}>AWB Number</p>
                    <p className="font-mono font-medium text-sm" style={{ color: '#1c1c1c' }}>{tracking.awb_code}</p>
                  </div>
                )}
              </div>

              {tracking.tracking_url && (
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase hover:underline"
                  style={{ color: '#363636' }}
                >
                  <ExternalLink size={12} /> Track on courier website
                </a>
              )}

              {shipmentInfo?.eta && (
                <div className="mt-4 px-4 py-3 flex items-center gap-2 text-sm"
                  style={{ backgroundColor: '#d4e3cb', border: '1px solid #347a07' }}>
                  <Clock size={14} style={{ color: '#347a07' }} />
                  <span style={{ color: '#1c1c1c' }}>
                    Estimated delivery: <strong>{shipmentInfo.eta}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold mb-6" style={{ color: '#9b9b9b' }}>
                  Shipment Progress
                </h3>
                <div className="relative">
                  <div className="absolute top-4 left-5 right-5 h-px" style={{ backgroundColor: '#e1e1e1' }} />
                  <div
                    className="absolute top-4 left-5 h-px transition-all duration-500"
                    style={{
                      backgroundColor: '#1c1c1c',
                      width: currentStepIndex >= 0
                        ? `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 2.5rem)`
                        : '0%',
                    }}
                  />
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, idx) => {
                      const done = idx <= currentStepIndex;
                      const active = idx === currentStepIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-9 h-9 flex items-center justify-center z-10 transition-all"
                            style={{
                              backgroundColor: done ? '#1c1c1c' : '#ffffff',
                              border: `2px solid ${done ? '#1c1c1c' : active ? '#1c1c1c' : '#e1e1e1'}`,
                              color: done ? '#ffffff' : active ? '#1c1c1c' : '#e1e1e1',
                              outline: active ? '3px solid #e1e1e1' : 'none',
                              outlineOffset: '2px',
                            }}>
                            <Icon size={14} />
                          </div>
                          <p className="text-[10px] font-bold tracking-[0.05em] text-center leading-tight uppercase"
                            style={{ color: done ? '#1c1c1c' : '#9b9b9b' }}>
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
              <div className="p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#ffffff' }}>
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold mb-5" style={{ color: '#9b9b9b' }}>
                  Tracking Activity
                </h3>
                <div className="space-y-0">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: idx === 0 ? '#1c1c1c' : '#e1e1e1' }} />
                        {idx < Math.min(activities.length, 8) - 1 && (
                          <div className="w-px flex-1 my-1" style={{ backgroundColor: '#e1e1e1' }} />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-semibold" style={{ color: idx === 0 ? '#1c1c1c' : '#363636' }}>
                          {activity.sr_status_label || activity.activity}
                        </p>
                        {activity.location && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#9b9b9b' }}>
                            <MapPin size={10} /> {activity.location}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: '#9b9b9b' }}>{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not yet shipped */}
            {!tracking.shipment_id && !isCancelled && (
              <div className="p-5 text-center" style={{ border: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
                <Package size={28} className="mx-auto mb-2" style={{ color: '#9b9b9b' }} />
                <p className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: '#1c1c1c' }}>Your order is being prepared</p>
                <p className="text-xs mt-1" style={{ color: '#363636' }}>
                  Live tracking will be available once your order is shipped
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-[10px] mt-8" style={{ color: '#9b9b9b' }}>
          Can't find your order?{' '}
          <a href="/contact" className="hover:underline" style={{ color: '#363636' }}>Contact us</a> for help.
        </p>
      </div>
    </div>
  );
}
