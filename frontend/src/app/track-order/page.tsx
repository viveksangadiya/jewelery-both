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
    <div className="min-h-screen py-14" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#EBEBCA', border: '1px solid #B68868' }}>
            <Truck size={28} style={{ color: '#642308' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
            Track Your Order
          </h1>
          <p className="text-sm" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Enter your order number to get live shipping updates
          </p>
        </div>

        {/* Search box */}
        <div className="p-6 mb-5" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: '#B68868' }}>Order Number</p>
          <div className="flex gap-0">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. HK-ABC123-XY"
              className="flex-1 px-4 py-3 text-sm outline-none font-mono transition-colors"
              style={{ border: '1px solid #EBEBCA', borderRight: 'none', color: '#642308', backgroundColor: '#FAF9EE' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
              onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
            />
            <button
              onClick={handleTrack}
              disabled={loading || !orderNumber.trim()}
              className="px-5 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 flex-shrink-0 transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => { if (!loading && orderNumber.trim()) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
              onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#642308'); }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Search size={14} />}
              Track
            </button>
          </div>
          {error && (
            <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: '#b91c1c' }}>
              <XCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Tracking result */}
        {tracking && (
          <div className="space-y-4">

            {/* Order summary */}
            <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1" style={{ color: '#B68868' }}>Order Number</p>
                  <p className="font-mono font-bold text-lg" style={{ color: '#642308' }}>{tracking.order_number}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 font-bold tracking-[0.15em] uppercase capitalize"
                  style={{
                    backgroundColor: isCancelled ? '#FFF0EE' : tracking.status === 'delivered' ? '#EBEBCA' : '#FAF9EE',
                    color: isCancelled ? '#b91c1c' : '#642308',
                    border: `1px solid ${isCancelled ? '#f5c6c6' : '#EBEBCA'}`,
                  }}>
                  {tracking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div style={{ borderBottom: '1px solid #EBEBCA', paddingBottom: '0.75rem' }}>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#B68868' }}>Order Date</p>
                  <p className="font-medium text-sm" style={{ color: '#642308' }}>
                    {new Date(tracking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ borderBottom: '1px solid #EBEBCA', paddingBottom: '0.75rem' }}>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#B68868' }}>Payment</p>
                  <p className="font-medium text-sm capitalize" style={{ color: tracking.payment_status === 'paid' ? '#642308' : '#B68868' }}>
                    {tracking.payment_status}
                  </p>
                </div>
                {tracking.courier_name && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#B68868' }}>Courier</p>
                    <p className="font-medium text-sm" style={{ color: '#642308' }}>{tracking.courier_name}</p>
                  </div>
                )}
                {tracking.awb_code && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: '#B68868' }}>AWB Number</p>
                    <p className="font-mono font-medium text-sm" style={{ color: '#642308' }}>{tracking.awb_code}</p>
                  </div>
                )}
              </div>

              {tracking.tracking_url && (
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase hover:underline"
                  style={{ color: '#903E1D' }}
                >
                  <ExternalLink size={12} /> Track on courier website
                </a>
              )}

              {shipmentInfo?.eta && (
                <div className="mt-4 px-4 py-3 flex items-center gap-2 text-sm"
                  style={{ backgroundColor: '#EBEBCA', border: '1px solid #B68868' }}>
                  <Clock size={14} style={{ color: '#642308' }} />
                  <span style={{ color: '#642308' }}>
                    Estimated delivery: <strong>{shipmentInfo.eta}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold mb-6" style={{ color: '#B68868' }}>
                  Shipment Progress
                </h3>
                <div className="relative">
                  <div className="absolute top-4 left-5 right-5 h-px" style={{ backgroundColor: '#EBEBCA' }} />
                  <div
                    className="absolute top-4 left-5 h-px transition-all duration-500"
                    style={{
                      backgroundColor: '#642308',
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
                              backgroundColor: done ? '#642308' : '#FAF9EE',
                              border: `2px solid ${done ? '#642308' : active ? '#642308' : '#EBEBCA'}`,
                              color: done ? '#FAF9EE' : active ? '#642308' : '#EBEBCA',
                              outline: active ? '3px solid #EBEBCA' : 'none',
                              outlineOffset: '2px',
                            }}>
                            <Icon size={14} />
                          </div>
                          <p className="text-[10px] font-bold tracking-[0.05em] text-center leading-tight uppercase"
                            style={{ color: done ? '#642308' : '#B68868' }}>
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
              <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold mb-5" style={{ color: '#B68868' }}>
                  Tracking Activity
                </h3>
                <div className="space-y-0">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: idx === 0 ? '#642308' : '#EBEBCA' }} />
                        {idx < Math.min(activities.length, 8) - 1 && (
                          <div className="w-px flex-1 my-1" style={{ backgroundColor: '#EBEBCA' }} />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-semibold" style={{ color: idx === 0 ? '#642308' : '#903E1D' }}>
                          {activity.sr_status_label || activity.activity}
                        </p>
                        {activity.location && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#B68868' }}>
                            <MapPin size={10} /> {activity.location}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: '#B68868' }}>{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not yet shipped */}
            {!tracking.shipment_id && !isCancelled && (
              <div className="p-5 text-center" style={{ border: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
                <Package size={28} className="mx-auto mb-2" style={{ color: '#B68868' }} />
                <p className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: '#642308' }}>Your order is being prepared</p>
                <p className="text-xs mt-1" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  Live tracking will be available once your order is shipped
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-[10px] mt-8" style={{ color: '#B68868' }}>
          Can't find your order?{' '}
          <a href="/contact" className="hover:underline" style={{ color: '#903E1D' }}>Contact us</a> for help.
        </p>
      </div>
    </div>
  );
}
