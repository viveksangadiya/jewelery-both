'use client';
import Link from 'next/link';
import { Truck, Clock, MapPin, Shield, Package, ArrowRight } from 'lucide-react';

const shippingOptions = [
  { name: 'Standard Delivery', time: '3–5 Business Days', charge: 'Free above ₹499', detail: '₹79 for orders below ₹499' },
  { name: 'Express Delivery',  time: '1–2 Business Days', charge: '₹149',            detail: 'Available for select pin codes' },
  { name: 'Same Day Delivery', time: 'Same Day',           charge: '₹249',            detail: 'Order before 12 PM in metro cities' },
];

const faqs = [
  { q: 'When will my order be dispatched?', a: 'In-stock items are dispatched within 24–48 hours of order confirmation. Custom or made-to-order torans may take 5–7 business days.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within India only. International shipping is coming soon.' },
  { q: 'How do I track my order?', a: 'Once dispatched, you will receive an SMS and email with your tracking number. You can also track from the "Track Order" page.' },
  { q: 'What if my package is delayed?', a: 'Delays can occur due to weather, holidays, or courier issues. If your order is delayed beyond the estimated date, please contact our team.' },
  { q: 'Is my order insured during shipping?', a: 'Yes, all shipments are insured against loss or damage during transit. In case of any issue, we will replace or refund your order.' },
  { q: 'Can I change my delivery address?', a: 'Address changes can be requested within 2 hours of placing the order. Changes are not possible once the order is dispatched.' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero */}
      <div className="py-14 px-6 bg-brand-hover border-b border-brand-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5 bg-white border border-brand-border">
            <Truck size={20} className="text-brand-text" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-brand-text">
            Shipping Policy
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-brand-secondary">
            Every toran is carefully wrapped and shipped with love. Here's everything you need to know.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-14">

        {/* Shipping options table */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-brand-text">
            Shipping Options
          </h2>
          <div className="border border-brand-border">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-brand-hover">
              {['Method', 'Delivery Time', 'Charge', 'Notes'].map(h => (
                <p key={h} className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-text">{h}</p>
              ))}
            </div>
            {shippingOptions.map((opt, idx) => (
              <div key={opt.name} className="grid grid-cols-4 gap-4 px-5 py-4 items-center bg-white"
                style={{ borderTop: idx > 0 ? '1px solid #E0D9D0' : 'none' }}>
                <p className="text-sm font-semibold text-brand-text">{opt.name}</p>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-brand-muted flex-shrink-0" />
                  <p className="text-sm text-brand-secondary">{opt.time}</p>
                </div>
                <p className="text-sm font-semibold text-brand-text">{opt.charge}</p>
                <p className="text-xs text-brand-muted">{opt.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Shield,  title: 'Fully Insured',       desc: 'Every shipment is insured against loss or damage during transit.' },
            { icon: Package, title: 'Careful Packaging',   desc: 'Torans are wrapped in tissue paper, rolled or folded, and packed in sturdy boxes.' },
            { icon: MapPin,  title: 'Real-time Tracking',  desc: 'Track your order at every step via SMS, email, and our website.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 text-center bg-white border border-brand-border">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4 border border-brand-border">
                <Icon size={15} className="text-brand-muted" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-2 text-brand-text">{title}</p>
              <p className="text-xs leading-relaxed text-brand-secondary">{desc}</p>
            </div>
          ))}
        </section>

        {/* Policy details */}
        <section className="space-y-6 border-t border-brand-border pt-12">
          <h2 className="text-xl font-semibold text-brand-text">
            Shipping Details
          </h2>
          {[
            { title: 'Processing Time',    content: 'Orders placed before 2 PM on business days are processed the same day. Orders placed on weekends or public holidays are processed the next business day.' },
            { title: 'Delivery Coverage',  content: 'We deliver to 25,000+ pin codes across India. Enter your pin code at checkout to confirm delivery availability in your area.' },
            { title: 'Packaging',          content: 'All torans are wrapped in tissue paper and packed in eco-friendly kraft boxes. Ready for gifting — no extra wrapping needed!' },
            { title: 'Signature Required', content: 'For security, most orders require a signature upon delivery. Please ensure someone is available at the delivery address.' },
            { title: 'Failed Delivery',    content: 'If delivery fails due to unavailability, the courier will attempt delivery up to 3 times. After 3 failed attempts, the package is returned to us.' },
          ].map(({ title, content }) => (
            <div key={title} className="flex gap-6">
              <div className="w-0.5 flex-shrink-0 bg-brand-border" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-1.5 text-brand-text">{title}</p>
                <p className="text-sm leading-relaxed text-brand-secondary">{content}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQs */}
        <section className="border-t border-brand-border pt-12">
          <h2 className="text-xl font-semibold mb-8 text-brand-text">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="pb-6 border-b border-brand-border">
                <p className="text-sm font-semibold mb-2 text-brand-text">{q}</p>
                <p className="text-sm leading-relaxed text-brand-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-2">
          <p className="text-sm mb-4 text-brand-secondary">Questions about your shipment?</p>
          <Link href="/contact" className="btn-brand h-11 px-8 inline-flex">
            Contact Support <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
