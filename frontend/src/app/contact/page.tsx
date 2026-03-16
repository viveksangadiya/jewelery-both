'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';

const contactOptions = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with us instantly', action: 'Start Chat', available: true },
  { icon: Mail, title: 'Email Us', desc: 'hello@lumierejewels.com', action: 'Send Email', available: true },
  { icon: Phone, title: 'Call Us', desc: '+91 98765 43210', action: 'Call Now', available: true },
];

const faqs = [
  { q: 'How do I track my order?', a: 'Go to "Track Order" on our website or click the tracking link in your dispatch email.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled or modified within 2 hours of placing. Contact us immediately.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days. Express delivery is available in 1–2 days.' },
  { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for eligible items. See our Returns page for details.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#faf8f5] border-b border-gray-100 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            We're here to help. Reach out to us through any of the channels below and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Contact options */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {contactOptions.map(({ icon: Icon, title, desc, action }) => (
            <div key={title} className="border border-gray-100 p-6 text-center hover:border-gray-300 transition-colors group">
              <div className="w-12 h-12 border border-gray-200 group-hover:border-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Icon size={18} className="text-gray-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500 mb-4">{desc}</p>
              <button className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 hover:border-gray-900 hover:text-gray-900 pb-0.5 transition-colors">
                {action}
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-14">

          {/* Contact form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="border border-green-200 bg-green-50 p-8 text-center">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Thank you for reaching out. Our team will get back to you within 24 hours at <strong>{form.email}</strong>.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="text-xs font-bold uppercase tracking-widest text-gray-600 border-b border-gray-300 hover:border-gray-900 hover:text-gray-900 pb-0.5 transition-colors">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name *</label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Priya Sharma"
                      className={`w-full border px-4 py-3 text-sm outline-none transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full border border-gray-200 focus:border-gray-900 px-4 py-3 text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="priya@example.com"
                    className={`w-full border px-4 py-3 text-sm outline-none transition-colors ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-900 px-4 py-3 text-sm outline-none transition-colors bg-white appearance-none">
                    <option value="">Select a topic</option>
                    <option value="order">Order Enquiry</option>
                    <option value="return">Return / Exchange</option>
                    <option value="product">Product Question</option>
                    <option value="shipping">Shipping Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className={`w-full border px-4 py-3 text-sm outline-none transition-colors resize-none ${errors.message ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{form.message.length}/1000</p>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white py-4 text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send size={13} />}
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Info + FAQs */}
          <div className="space-y-10">
            {/* Store info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-5">Our Details</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Address', value: '123 Jeweler\'s Lane, Fort, Mumbai, Maharashtra 400001' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: Mail, label: 'Email', value: 'hello@lumierejewels.com' },
                  { icon: Clock, label: 'Support Hours', value: 'Mon–Sat: 9 AM – 7 PM IST\nSun: 10 AM – 5 PM IST' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-9 h-9 border border-gray-100 flex items-center justify-center flex-shrink-0 rounded-full">
                      <Icon size={15} className="text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Quick Answers</h2>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-1.5">{q}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="bg-gray-50 border border-gray-100 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Response Times</p>
              <div className="space-y-2">
                {[
                  { channel: 'Live Chat', time: 'Under 2 minutes' },
                  { channel: 'Phone', time: 'Immediate' },
                  { channel: 'Email / Form', time: 'Within 24 hours' },
                  { channel: 'WhatsApp', time: 'Within 4 hours' },
                ].map(({ channel, time }) => (
                  <div key={channel} className="flex justify-between text-xs">
                    <span className="text-gray-600">{channel}</span>
                    <span className="text-gray-900 font-semibold">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
