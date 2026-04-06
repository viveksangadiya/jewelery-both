'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, Banknote, ChevronRight, Tag, MapPin, User, Phone } from 'lucide-react';
import { useCartStore, useAuthStore, itemPrice } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Address {
  name: string; phone: string;
  address_line1: string; address_line2: string;
  city: string; state: string; pincode: string;
}

type PaymentMethod = 'razorpay' | 'cod';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

declare global { interface Window { Razorpay: any; } }

// Shared input style
const inputStyle = {
  border: '1px solid #EBEBCA',
  color: '#642308',
  backgroundColor: 'white',
  outline: 'none',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#B68868' }}>
        {label}{required && <span style={{ color: '#903E1D' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export default function CheckoutPage(): JSX.Element {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);

  const [mounted, setMounted]               = useState(false);
  const [step, setStep]                     = useState<1 | 2>(1);
  const [address, setAddress]               = useState<Address>({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: 'Gujarat', pincode: '' });
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>('razorpay');
  const [couponCode, setCouponCode]         = useState('');
  const [couponApplied, setCouponApplied]   = useState(false);
  const [discount, setDiscount]             = useState(0);
  const [loading, setLoading]               = useState(false);
  const [eta, setEta]                       = useState('');
  const [pincodeOk, setPincodeOk]           = useState<boolean | null>(null);
  const [guestEmail, setGuestEmail]         = useState('');

  const safeItems = Array.isArray(items) ? items : [];
  const subtotal  = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const shipping  = subtotal >= 499 ? 0 : 99;
  const total     = Math.round(subtotal - discount + shipping);

  useEffect(() => {
    setMounted(true);
    setAddress(p => ({ ...p, name: user?.name || '', phone: user?.phone || '' }));
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [user]);

  useEffect(() => {
    if (mounted && safeItems.length === 0) router.push('/shop');
    // guests: force COD
    if (mounted && !user) setPaymentMethod('cod');
  }, [mounted, user, items]);

  const set = (k: keyof Address, v: string) => setAddress(p => ({ ...p, [k]: v }));

  const checkPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    try {
      const res = await api.get(`/shiprocket/serviceability?pincode=${pin}`);
      const d = res.data.data;
      setPincodeOk(d.is_serviceable);
      if (d.is_serviceable) {
        setEta(d.estimated_delivery || '');
        toast.success(`Delivery available!`);
      } else {
        toast.error('Delivery not available at this pincode');
      }
    } catch { setPincodeOk(true); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/orders/validate-coupon', { code: couponCode, subtotal });
      setDiscount(res.data.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${res.data.data.discount}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    }
  };

  const validateAddress = (): boolean => {
    const { name, phone, address_line1, city, state, pincode } = address;
    if (!name || !phone || !address_line1 || !city || !state || !pincode) { toast.error('Please fill all required fields'); return false; }
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error('Enter a valid 10-digit mobile number'); return false; }
    if (!/^\d{6}$/.test(pincode))     { toast.error('Enter a valid 6-digit pincode'); return false; }
    if (!user && !guestEmail.trim()) { toast.error('Please enter your email address'); return false; }
    if (!user && !/\S+@\S+\.\S+/.test(guestEmail)) { toast.error('Please enter a valid email address'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) { await handleGuestCOD(); return; }
    if (paymentMethod === 'razorpay') await handleRazorpay();
    else await handleCOD();
  };

  const handleGuestCOD = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/guest-cod-order', {
        shipping_address: address,
        items: safeItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        email: guestEmail,
      });
      clearCart();
      router.push(`/order-success?order=${res.data.data.order_number}&method=cod`);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to place order'); setLoading(false); }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        shipping_address: address,
        coupon_code: couponApplied ? couponCode : undefined,
      });
      const { razorpay_order_id, amount, currency, key_id } = res.data.data;
      const options = {
        key: key_id, amount, currency,
        name: 'HastKala',
        description: 'Handmade Craft Order',
        order_id: razorpay_order_id,
        prefill: { name: address.name, contact: address.phone, email: user?.email || '' },
        theme: { color: '#903E1D' },
        handler: async (resp: any) => {
          try {
            const verify = await api.post('/payment/verify', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            if (verify.data.success) { clearCart(); router.push(`/order-success?order=${verify.data.data.order_number}`); }
          } catch (e: any) { toast.error(e.response?.data?.message || 'Payment verification failed'); setLoading(false); }
        },
        modal: { ondismiss: () => { setLoading(false); toast('Payment cancelled', { icon: '⚠️' }); } },
      };
      new window.Razorpay(options).open();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to initiate payment'); setLoading(false); }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/cod-order', {
        shipping_address: address,
        coupon_code: couponApplied ? couponCode : undefined,
      });
      clearCart();
      router.push(`/order-success?order=${res.data.data.order_number}&method=cod`);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to place order'); setLoading(false); }
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#EBEBCA', borderTopColor: '#903E1D' }} />
    </div>
  );

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-2xl font-normal" style={{ color: '#642308' }}>Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#B68868' }}>
            <ShieldCheck size={13} style={{ color: '#903E1D' }} /> Secure checkout
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {['Delivery Address', 'Payment'].map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: step > idx ? '#642308' : step === idx + 1 ? '#903E1D' : '#EBEBCA',
                  color: step > idx || step === idx + 1 ? '#FAF9EE' : '#B68868',
                }}>
                {step > idx ? '✓' : idx + 1}
              </div>
              <span className="text-xs font-medium"
                style={{ color: step === idx + 1 ? '#642308' : '#B68868' }}>
                {label}
              </span>
              {idx < 1 && <ChevronRight size={13} style={{ color: '#EBEBCA' }} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* ── Step 1: Address ── */}
            {step === 1 && (
              <div className="p-6" style={{ backgroundColor: 'white', border: '1px solid #EBEBCA' }}>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={15} style={{ color: '#903E1D' }} />
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#642308' }}>
                    Delivery Address
                  </h2>
                </div>
                {!user && (
                  <div className="mb-5 pb-5" style={{ borderBottom: '1px solid #EBEBCA' }}>
                    <p className="text-xs mb-3" style={{ color: '#903E1D' }}>
                      Checking out as guest. <a href="/account/login?redirect=/checkout" className="underline" style={{ color: '#642308' }}>Sign in</a> for a faster experience.
                    </p>
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        className="w-full px-4 py-3 text-sm"
                        style={inputStyle}
                        placeholder="your@email.com"
                        onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                      />
                    </Field>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                      <input value={address.name} onChange={e => set('name', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 text-sm"
                        style={inputStyle} placeholder="Your full name"
                        onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
                    </div>
                  </Field>
                  <Field label="Mobile" required>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B68868' }} />
                      <input value={address.phone} onChange={e => set('phone', e.target.value)} maxLength={10}
                        className="w-full pl-9 pr-4 py-3 text-sm"
                        style={inputStyle} placeholder="10-digit mobile"
                        onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 1" required>
                      <input value={address.address_line1} onChange={e => set('address_line1', e.target.value)}
                        className="w-full px-4 py-3 text-sm"
                        style={inputStyle} placeholder="House No, Street, Area"
                        onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 2">
                      <input value={address.address_line2} onChange={e => set('address_line2', e.target.value)}
                        className="w-full px-4 py-3 text-sm"
                        style={inputStyle} placeholder="Landmark, Colony (optional)"
                        onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
                    </Field>
                  </div>
                  <Field label="City" required>
                    <input value={address.city} onChange={e => set('city', e.target.value)}
                      className="w-full px-4 py-3 text-sm"
                      style={inputStyle} placeholder="Jaipur"
                      onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
                  </Field>
                  <Field label="Pincode" required>
                    <input
                      value={address.pincode}
                      onChange={e => { set('pincode', e.target.value); if (e.target.value.length === 6) checkPincode(e.target.value); }}
                      maxLength={6}
                      className="w-full px-4 py-3 text-sm"
                      style={{
                        ...inputStyle,
                        borderColor: pincodeOk === true ? '#903E1D' : pincodeOk === false ? '#b91c1c' : '#EBEBCA',
                      }}
                      placeholder="400001"
                      onFocus={e => { if (pincodeOk === null) e.currentTarget.style.borderColor = '#B68868'; }}
                      onBlur={e => { if (pincodeOk === null) e.currentTarget.style.borderColor = '#EBEBCA'; }}
                    />
                    {pincodeOk && eta && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#642308' }}>
                        <Truck size={11} /> Est. delivery: {eta}
                      </p>
                    )}
                  </Field>
                  <Field label="State" required>
                    <select value={address.state} onChange={e => set('state', e.target.value)}
                      className="w-full px-4 py-3 text-sm appearance-none"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <button
                  onClick={() => { if (validateAddress()) setStep(2); }}
                  className="mt-6 w-full py-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
                  Continue to Payment <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <div className="p-6" style={{ backgroundColor: 'white', border: '1px solid #EBEBCA' }}>
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={15} style={{ color: '#903E1D' }} />
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#642308' }}>
                    Payment Method
                  </h2>
                </div>

                {/* Address summary */}
                <div className="flex items-start justify-between p-4 mb-6"
                  style={{ backgroundColor: '#FAF9EE', border: '1px solid #EBEBCA' }}>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#B68868' }}>
                      Delivering to
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#642308' }}>
                      {address.name} · {address.phone}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#903E1D' }}>
                      {address.address_line1}, {address.city}, {address.state} – {address.pincode}
                    </p>
                  </div>
                  <button onClick={() => setStep(1)}
                    className="text-xs font-bold ml-3 whitespace-nowrap underline underline-offset-2 transition-colors"
                    style={{ color: '#903E1D' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
                    Change
                  </button>
                </div>

                {/* Payment options */}
                {!user && (
                  <div className="flex items-center gap-2 px-4 py-3 mb-3 text-xs"
                    style={{ backgroundColor: '#FAF9EE', border: '1px solid #EBEBCA', color: '#903E1D' }}>
                    <Banknote size={13} style={{ color: '#642308', flexShrink: 0 }} />
                    Guest orders are Cash on Delivery only. Sign in to pay online.
                  </div>
                )}
                <div className="space-y-3">
                  {([
                    {
                      value: 'razorpay' as PaymentMethod,
                      icon: CreditCard,
                      title: 'Pay Online',
                      subtitle: 'UPI, Cards, Net Banking, Wallets via Razorpay',
                      badges: ['UPI', 'Visa', 'Mastercard'],
                      guestHidden: true,
                    },
                    {
                      value: 'cod' as PaymentMethod,
                      icon: Banknote,
                      title: 'Cash on Delivery',
                      subtitle: 'Pay when your order arrives at your doorstep',
                      badges: [],
                      guestHidden: false,
                    },
                  ] as Array<{ value: PaymentMethod; icon: any; title: string; subtitle: string; badges: string[]; guestHidden: boolean }>)
                  .filter(opt => !(!user && opt.guestHidden))
                  .map(opt => (
                    <label key={opt.value}
                      className="flex items-center gap-4 p-4 cursor-pointer transition-all"
                      style={{
                        border: `1px solid ${paymentMethod === opt.value ? '#642308' : '#EBEBCA'}`,
                        backgroundColor: paymentMethod === opt.value ? '#FAF9EE' : 'white',
                      }}>
                      <input type="radio" name="payment" value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        style={{ accentColor: '#903E1D' }} />
                      <opt.icon size={18} style={{ color: paymentMethod === opt.value ? '#642308' : '#B68868' }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#642308' }}>{opt.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#903E1D' }}>{opt.subtitle}</p>
                      </div>
                      {opt.badges.length > 0 && (
                        <div className="flex gap-1">
                          {opt.badges.map(b => (
                            <span key={b} className="text-xs px-1.5 py-0.5 font-medium"
                              style={{ border: '1px solid #EBEBCA', color: '#903E1D' }}>{b}</span>
                          ))}
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="mt-6 w-full py-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'rgba(250,249,238,0.4)', borderTopColor: '#FAF9EE' }} />
                      Processing…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${total.toLocaleString()}`}
                    </>
                  )}
                </button>
                <p className="text-center text-xs mt-3" style={{ color: '#B68868' }}>
                  🔒 Secured by {paymentMethod === 'razorpay' ? 'Razorpay' : '256-bit SSL'}
                </p>
              </div>
            )}
          </div>

          {/* ── Order Summary sidebar ── */}
          <div>
            <div className="p-5 sticky top-24" style={{ backgroundColor: 'white', border: '1px solid #EBEBCA' }}>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: '#642308' }}>
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
                {safeItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#EBEBCA' }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#642308' }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#B68868' }}>Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#642308' }}>
                      ₹{(itemPrice(item) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px mb-4" style={{ backgroundColor: '#EBEBCA' }} />

              {/* Coupon */}
              {!couponApplied ? (
                <div className="flex gap-0 mb-4">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5"
                    style={{ border: '1px solid #EBEBCA', borderRight: 'none' }}>
                    <Tag size={11} style={{ color: '#B68868' }} />
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 text-xs outline-none bg-transparent font-mono tracking-widest"
                      style={{ color: '#642308' }} />
                  </div>
                  <button onClick={applyCoupon}
                    className="px-4 text-[10px] font-bold tracking-widest uppercase transition-colors"
                    style={{ backgroundColor: '#EBEBCA', color: '#642308' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d4c9a0')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EBEBCA')}>
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2.5 mb-4"
                  style={{ backgroundColor: '#EBEBCA' }}>
                  <span className="text-xs font-bold" style={{ color: '#642308' }}>✓ {couponCode} applied</span>
                  <button onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(''); }}
                    className="text-xs underline" style={{ color: '#903E1D' }}>Remove</button>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: '#903E1D' }}>Subtotal</span>
                  <span style={{ color: '#642308' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: '#903E1D' }}>Discount</span>
                    <span style={{ color: '#642308' }}>−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: '#903E1D' }}>Shipping</span>
                  <span style={{ color: '#642308' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 font-bold"
                style={{ borderTop: '1px solid #EBEBCA' }}>
                <span className="text-xs tracking-[0.15em] uppercase" style={{ color: '#642308' }}>Total</span>
                <span className="text-lg" style={{ color: '#642308' }}>₹{total.toLocaleString()}</span>
              </div>

              <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid #EBEBCA' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#B68868' }}>
                  <ShieldCheck size={12} style={{ color: '#903E1D' }} /> 100% Secure Payments
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#B68868' }}>
                  <Truck size={12} style={{ color: '#903E1D' }} /> Shipped via Shiprocket
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
