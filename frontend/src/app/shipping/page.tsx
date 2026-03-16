import Link from 'next/link';
import { Truck, Clock, MapPin, Shield, Package, ArrowRight } from 'lucide-react';

const shippingOptions = [
  { name: 'Standard Delivery', time: '3–5 Business Days', charge: 'Free above ₹999', detail: '₹99 for orders below ₹999' },
  { name: 'Express Delivery', time: '1–2 Business Days', charge: '₹199', detail: 'Available for select pin codes' },
  { name: 'Same Day Delivery', time: 'Same Day', charge: '₹299', detail: 'Order before 12 PM in metro cities' },
];

const faqs = [
  { q: 'When will my order be dispatched?', a: 'In-stock items are dispatched within 24–48 hours of order confirmation. Custom or made-to-order items may take 5–7 business days to dispatch.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within India only. International shipping is coming soon. Sign up for our newsletter to be notified.' },
  { q: 'How do I track my order?', a: 'Once dispatched, you will receive an SMS and email with your tracking number. You can also track your order from the "Track Order" page on our website.' },
  { q: 'What if my package is delayed?', a: 'Delays can occur due to weather, holidays, or courier issues. If your order is delayed beyond the estimated date, please contact our support team.' },
  { q: 'Is my jewelry insured during shipping?', a: 'Yes, all shipments are fully insured against loss or damage during transit. In case of any issue, we will replace or refund your order.' },
  { q: 'Can I change my delivery address?', a: 'Address changes can be requested within 2 hours of placing the order by contacting our support. Changes are not possible once the order is dispatched.' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#faf8f5] border-b border-gray-100 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Truck size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Shipping Policy</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            Every piece of jewelry is carefully packaged and shipped with love. Here's everything you need to know about our shipping process.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* Shipping options */}
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">Shipping Options</h2>
          <div className="border border-gray-100 divide-y divide-gray-100">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-gray-50">
              {['Method', 'Delivery Time', 'Charge', 'Notes'].map(h => (
                <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</p>
              ))}
            </div>
            {shippingOptions.map(opt => (
              <div key={opt.name} className="grid grid-cols-4 gap-4 px-5 py-4 items-center">
                <p className="text-sm font-semibold text-gray-900">{opt.name}</p>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{opt.time}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{opt.charge}</p>
                <p className="text-xs text-gray-400">{opt.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Fully Insured', desc: 'Every shipment is insured against loss or damage during transit.' },
            { icon: Package, title: 'Secure Packaging', desc: 'Jewelry is packed in tamper-proof boxes with bubble wrap and foam padding.' },
            { icon: MapPin, title: 'Real-time Tracking', desc: 'Track your order at every step via SMS, email, and our website.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-gray-100 p-6 text-center">
              <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={16} className="text-gray-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* Policy details */}
        <section className="border-t border-gray-100 pt-12 space-y-6">
          <h2 className="font-display text-2xl font-bold text-gray-900">Shipping Details</h2>
          {[
            { title: 'Processing Time', content: 'Orders placed before 2 PM on business days are processed the same day. Orders placed on weekends or public holidays are processed the next business day.' },
            { title: 'Delivery Coverage', content: 'We deliver to 25,000+ pin codes across India. Enter your pin code at checkout to confirm delivery availability in your area.' },
            { title: 'Packaging', content: 'All jewelry is shipped in our signature gift box with a soft pouch, authenticity card, and care instructions. Perfect for gifting!' },
            { title: 'Signature Required', content: 'For security, most jewelry orders require a signature upon delivery. Please ensure someone is available at the delivery address.' },
            { title: 'Failed Delivery', content: 'If delivery fails due to unavailability, the courier will attempt delivery up to 3 times. After 3 failed attempts, the package is returned to us.' },
          ].map(({ title, content }) => (
            <div key={title} className="flex gap-6">
              <div className="w-1 bg-gray-100 flex-shrink-0 rounded-full" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-1.5">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{content}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQs */}
        <section className="border-t border-gray-100 pt-12">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6 last:border-0">
                <p className="text-sm font-bold text-gray-900 mb-2">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 mb-4">Questions about your shipment?</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
            Contact Support <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
