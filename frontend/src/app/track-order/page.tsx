'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, ExternalLink, Mail, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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

const quickLinks = [
  { href: '/contact',  icon: Mail,       label: 'Contact Us',   desc: 'Get help from our team' },
  { href: '/returns',  icon: RefreshCw,  label: 'Returns',      desc: 'Initiate a return or exchange' },
  { href: '/shipping', icon: Truck,      label: 'Shipping Info', desc: 'Delivery times & policies' },
  { href: '/account',  icon: Package,    label: 'My Orders',    desc: 'View all your orders' },
];

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
    <div className="min-h-screen py-14 bg-brand-bg">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5 bg-brand-hover border border-brand-border">
            <Truck size={28} className="text-brand-text" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2 text-brand-text">
            Track Your Order
          </h1>
          <p className="text-sm text-brand-secondary">
            Enter your order number to get live shipping updates
          </p>
        </div>

        {/* Search box */}
        <div className="p-6 mb-5 bg-white border border-brand-border">
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2 text-brand-muted">Order Number</p>
          <div className="flex gap-0">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. HK-ABC123-XY"
              className="flex-1 px-4 py-3 text-sm outline-none font-mono transition-colors border border-brand-border border-r-0 bg-white text-brand-text placeholder:text-brand-muted focus:border-brand-text"
            />
            <button
              onClick={handleTrack}
              disabled={loading || !orderNumber.trim()}
              className="btn-brand px-5 flex-shrink-0 disabled:opacity-50"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Search size={14} />}
              Track
            </button>
          </div>
          {error && (
            <p className="mt-3 text-xs flex items-center gap-1.5 text-red-600">
              <XCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Tracking result */}
        {tracking && (
          <div className="space-y-4">

            {/* Order summary */}
            <div className="p-6 bg-white border border-brand-border">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1 text-brand-muted">Order Number</p>
                  <p className="font-mono font-bold text-lg text-brand-text">{tracking.order_number}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 font-medium tracking-[0.15em] uppercase capitalize border"
                  style={{
                    backgroundColor: isCancelled ? '#fff0f0' : tracking.status === 'delivered' ? '#d4e3cb' : '#EDE8E2',
                    color: isCancelled ? '#e32c2b' : '#000',
                    borderColor: isCancelled ? '#f5c6c6' : '#E0D9D0',
                  }}>
                  {tracking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border-b border-brand-border pb-3">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5 text-brand-muted">Order Date</p>
                  <p className="font-medium text-sm text-brand-text">
                    {new Date(tracking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="border-b border-brand-border pb-3">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5 text-brand-muted">Payment</p>
                  <p className={`font-medium text-sm capitalize ${tracking.payment_status === 'paid' ? 'text-green-700' : 'text-brand-muted'}`}>
                    {tracking.payment_status}
                  </p>
                </div>
                {tracking.courier_name && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5 text-brand-muted">Courier</p>
                    <p className="font-medium text-sm text-brand-text">{tracking.courier_name}</p>
                  </div>
                )}
                {tracking.awb_code && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5 text-brand-muted">AWB Number</p>
                    <p className="font-mono font-medium text-sm text-brand-text">{tracking.awb_code}</p>
                  </div>
                )}
              </div>

              {tracking.tracking_url && (
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-xs font-medium tracking-[0.1em] uppercase hover:underline text-brand-secondary"
                >
                  <ExternalLink size={12} /> Track on courier website
                </a>
              )}

              {shipmentInfo?.eta && (
                <div className="mt-4 px-4 py-3 flex items-center gap-2 text-sm bg-green-50 border border-green-200">
                  <Clock size={14} className="text-green-700" />
                  <span className="text-brand-text">
                    Estimated delivery: <strong>{shipmentInfo.eta}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="p-6 bg-white border border-brand-border">
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-medium mb-6 text-brand-muted">
                  Shipment Progress
                </h3>
                <div className="relative">
                  <div className="absolute top-4 left-5 right-5 h-px bg-brand-border" />
                  <div
                    className="absolute top-4 left-5 h-px bg-brand-text transition-all duration-500"
                    style={{
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
                              backgroundColor: done ? '#000' : '#fff',
                              border: `2px solid ${done ? '#000' : active ? '#000' : '#E0D9D0'}`,
                              color: done ? '#fff' : active ? '#000' : '#E0D9D0',
                              outline: active ? '3px solid #E0D9D0' : 'none',
                              outlineOffset: '2px',
                            }}>
                            <Icon size={14} />
                          </div>
                          <p className="text-[10px] font-medium tracking-[0.05em] text-center leading-tight uppercase"
                            style={{ color: done ? '#000' : '#999' }}>
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
              <div className="p-6 bg-white border border-brand-border">
                <h3 className="text-[10px] tracking-[0.25em] uppercase font-medium mb-5 text-brand-muted">
                  Tracking Activity
                </h3>
                <div className="space-y-0">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: idx === 0 ? '#000' : '#E0D9D0' }} />
                        {idx < Math.min(activities.length, 8) - 1 && (
                          <div className="w-px flex-1 my-1 bg-brand-border" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className={`text-sm font-semibold ${idx === 0 ? 'text-brand-text' : 'text-brand-secondary'}`}>
                          {activity.sr_status_label || activity.activity}
                        </p>
                        {activity.location && (
                          <p className="text-xs flex items-center gap-1 mt-0.5 text-brand-muted">
                            <MapPin size={10} /> {activity.location}
                          </p>
                        )}
                        <p className="text-xs mt-0.5 text-brand-muted">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not yet shipped */}
            {!tracking.shipment_id && !isCancelled && (
              <div className="p-5 text-center bg-brand-hover border border-brand-border">
                <Package size={28} className="mx-auto mb-2 text-brand-muted" />
                <p className="text-sm font-medium tracking-[0.1em] uppercase text-brand-text">Your order is being prepared</p>
                <p className="text-xs mt-1 text-brand-secondary">
                  Live tracking will be available once your order is shipped
                </p>
              </div>
            )}
          </div>
        )}

        {/* Check other sections */}
        <div className="mt-12">
          <p className="text-[10px] tracking-[0.25em] uppercase font-medium text-brand-muted text-center mb-5">
            Helpful Links
          </p>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 p-4 bg-white border border-brand-border hover:border-brand-text transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-brand-hover border border-brand-border group-hover:border-brand-text transition-colors">
                  <Icon size={13} className="text-brand-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-brand-text">{label}</p>
                  <p className="text-[10px] mt-0.5 text-brand-muted leading-tight">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Not yet solved CTA */}
        <div className="mt-10 text-center">
          <p className="text-xs text-brand-secondary mb-3">
            Still having trouble with your order?
          </p>
          <Link href="/contact" className="btn-brand h-11 px-8 inline-flex">
            Contact Us <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
