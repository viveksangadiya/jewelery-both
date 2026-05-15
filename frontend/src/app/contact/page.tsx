'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to "Track Order" on our website or click the tracking link in your dispatch email.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled or modified within 2 hours of placing. Contact us immediately.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days. Express delivery is available in select pin codes.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for eligible items. See our Returns page for details.' },
];

const inputCls = 'w-full px-4 py-3 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors';

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
    try {
      await contactApi.send(form);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero */}
      <div className="py-14 px-6 bg-brand-hover border-b border-brand-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5 bg-white border border-brand-border">
            <Mail size={20} className="text-brand-text" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-brand-text">
            Contact Us
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-brand-secondary">
            We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Contact options */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: MessageCircle, title: 'WhatsApp', desc: '+91 98765 43210', action: 'Message Us' },
            { icon: Mail,          title: 'Email Us', desc: 'hello@hastkala.in', action: 'Send Email' },
            { icon: Phone,         title: 'Call Us',  desc: '+91 98765 43210', action: 'Call Now' },
          ].map(({ icon: Icon, title, desc, action }) => (
            <div key={title} className="group p-6 text-center bg-white border border-brand-border hover:border-brand-text transition-colors">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4 border border-brand-border group-hover:border-brand-text transition-colors">
                <Icon size={17} className="text-brand-muted" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-1 text-brand-text">{title}</p>
              <p className="text-xs mb-4 text-brand-secondary">{desc}</p>
              <button className="text-[10px] font-medium uppercase tracking-[0.15em] pb-0.5 text-brand-text border-b border-brand-text">
                {action}
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-brand-text">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 text-center border border-brand-border bg-green-50">
                <CheckCircle size={36} className="mx-auto mb-4 text-green-700" strokeWidth={1.5} />
                <h3 className="font-semibold text-lg mb-2 text-brand-text">
                  Message Received!
                </h3>
                <p className="text-sm leading-relaxed mb-5 text-brand-secondary">
                  Thank you for reaching out. We'll reply within 24 hours at <strong>{form.email}</strong>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="text-[10px] font-medium uppercase tracking-[0.15em] pb-0.5 text-brand-text border-b border-brand-text"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] mb-1.5 text-brand-muted">
                      Full Name *
                    </label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Priya Sharma"
                      className={inputCls}
                      style={{ borderColor: errors.name ? '#e32c2b' : undefined }}
                    />
                    {errors.name && <p className="text-[11px] mt-1 text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] mb-1.5 text-brand-muted">
                      Phone
                    </label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.2em] mb-1.5 text-brand-muted">
                    Email Address *
                  </label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="priya@example.com"
                    className={inputCls}
                    style={{ borderColor: errors.email ? '#e32c2b' : undefined }}
                  />
                  {errors.email && <p className="text-[11px] mt-1 text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.2em] mb-1.5 text-brand-muted">
                    Subject
                  </label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Enquiry</option>
                    <option value="return">Return / Exchange</option>
                    <option value="product">Product Question</option>
                    <option value="custom">Custom Order</option>
                    <option value="shipping">Shipping Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.2em] mb-1.5 text-brand-muted">
                    Message *
                  </label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className={`${inputCls} resize-none`}
                    style={{ borderColor: errors.message ? '#e32c2b' : undefined }}
                  />
                  {errors.message && <p className="text-[11px] mt-1 text-red-600">{errors.message}</p>}
                  <p className="text-[10px] mt-1 text-right text-brand-muted">{form.message.length}/1000</p>
                </div>

                <button type="submit" disabled={submitting}
                  className="btn-brand w-full h-12 disabled:opacity-50"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <Send size={12} />}
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Info + FAQs */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold mb-5 text-brand-text">
                Our Details
              </h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin,  label: 'Address',       value: 'Plot 14, Craft Bazaar, Johari Bazaar\nJaipur, Rajasthan 302003' },
                  { icon: Phone,   label: 'Phone',         value: '+91 98765 43210' },
                  { icon: Mail,    label: 'Email',         value: 'hello@hastkala.in' },
                  { icon: Clock,   label: 'Support Hours', value: 'Mon–Sat: 9 AM – 7 PM IST\nSun: 10 AM – 4 PM IST' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 border border-brand-border bg-white">
                      <Icon size={13} className="text-brand-muted" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-0.5 text-brand-muted">{label}</p>
                      <p className="text-sm whitespace-pre-line leading-relaxed text-brand-text">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-lg font-semibold mb-5 text-brand-text">
                Quick Answers
              </h2>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="pb-4 border-b border-brand-border">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 text-brand-text">{q}</p>
                    <p className="text-xs leading-relaxed text-brand-secondary">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response times */}
            <div className="p-5 bg-white border border-brand-border">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3 text-brand-muted">Response Times</p>
              <div className="space-y-2">
                {[
                  { channel: 'WhatsApp',    time: 'Within 4 hours' },
                  { channel: 'Phone',       time: 'Immediate' },
                  { channel: 'Email / Form', time: 'Within 24 hours' },
                ].map(({ channel, time }) => (
                  <div key={channel} className="flex justify-between text-xs py-1.5 border-b border-brand-border">
                    <span className="text-brand-secondary">{channel}</span>
                    <span className="font-semibold text-brand-text">{time}</span>
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
