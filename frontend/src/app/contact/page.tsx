'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to "Track Order" on our website or click the tracking link in your dispatch email.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled or modified within 2 hours of placing. Contact us immediately.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days. Express delivery is available in select pin codes.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for eligible items. See our Returns page for details.' },
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
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const inputBase = {
    border: '1px solid #EBEBCA',
    color: '#642308',
    backgroundColor: '#FAF9EE',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9EE' }}>

      {/* Hero */}
      <div className="py-14 px-6" style={{ backgroundColor: '#EBEBCA', borderBottom: '1px solid #B68868' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#FAF9EE', border: '1px solid #B68868' }}>
            <Mail size={20} style={{ color: '#642308' }} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
            Contact Us
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
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
            <div key={title} className="p-6 text-center transition-colors"
              style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#B68868')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#EBEBCA')}
            >
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4"
                style={{ border: '1px solid #EBEBCA' }}>
                <Icon size={17} style={{ color: '#B68868' }} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#642308' }}>{title}</p>
              <p className="text-xs mb-4" style={{ color: '#903E1D' }}>{desc}</p>
              <button className="text-[10px] font-bold uppercase tracking-[0.15em] pb-0.5 transition-colors"
                style={{ color: '#642308', borderBottom: '1px solid #642308' }}>
                {action}
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 text-center" style={{ border: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
                <CheckCircle size={36} className="mx-auto mb-4" style={{ color: '#642308' }} strokeWidth={1.5} />
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
                  Message Received!
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#903E1D' }}>
                  Thank you for reaching out. We'll reply within 24 hours at <strong>{form.email}</strong>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="text-[10px] font-bold uppercase tracking-[0.15em] pb-0.5 transition-colors"
                  style={{ color: '#642308', borderBottom: '1px solid #642308' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#B68868' }}>
                      Full Name *
                    </label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Priya Sharma"
                      className="w-full px-4 py-3 text-sm outline-none transition-colors"
                      style={{ ...inputBase, borderColor: errors.name ? '#b91c1c' : '#EBEBCA' }}
                      onFocus={e => (e.currentTarget.style.borderColor = errors.name ? '#b91c1c' : '#B68868')}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.name ? '#b91c1c' : '#EBEBCA')}
                    />
                    {errors.name && <p className="text-[11px] mt-1" style={{ color: '#b91c1c' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#B68868' }}>
                      Phone
                    </label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 text-sm outline-none transition-colors"
                      style={inputBase}
                      onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#B68868' }}>
                    Email Address *
                  </label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-4 py-3 text-sm outline-none transition-colors"
                    style={{ ...inputBase, borderColor: errors.email ? '#b91c1c' : '#EBEBCA' }}
                    onFocus={e => (e.currentTarget.style.borderColor = errors.email ? '#b91c1c' : '#B68868')}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.email ? '#b91c1c' : '#EBEBCA')}
                  />
                  {errors.email && <p className="text-[11px] mt-1" style={{ color: '#b91c1c' }}>{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#B68868' }}>
                    Subject
                  </label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors appearance-none"
                    style={inputBase}
                    onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
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
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#B68868' }}>
                    Message *
                  </label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors resize-none"
                    style={{ ...inputBase, borderColor: errors.message ? '#b91c1c' : '#EBEBCA' }}
                    onFocus={e => (e.currentTarget.style.borderColor = errors.message ? '#b91c1c' : '#B68868')}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.message ? '#b91c1c' : '#EBEBCA')}
                  />
                  {errors.message && <p className="text-[11px] mt-1" style={{ color: '#b91c1c' }}>{errors.message}</p>}
                  <p className="text-[10px] mt-1 text-right" style={{ color: '#B68868' }}>{form.message.length}/1000</p>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-4 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                  onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#642308'); }}
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
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
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
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                      <Icon size={13} style={{ color: '#B68868' }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#B68868' }}>{label}</p>
                      <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: '#642308' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
                Quick Answers
              </h2>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="pb-4" style={{ borderBottom: '1px solid #EBEBCA' }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: '#642308' }}>{q}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#903E1D' }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response times */}
            <div className="p-5" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#B68868' }}>Response Times</p>
              <div className="space-y-2">
                {[
                  { channel: 'WhatsApp',    time: 'Within 4 hours' },
                  { channel: 'Phone',       time: 'Immediate' },
                  { channel: 'Email / Form', time: 'Within 24 hours' },
                ].map(({ channel, time }) => (
                  <div key={channel} className="flex justify-between text-xs py-1.5" style={{ borderBottom: '1px solid #EBEBCA' }}>
                    <span style={{ color: '#903E1D' }}>{channel}</span>
                    <span className="font-semibold" style={{ color: '#642308' }}>{time}</span>
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
