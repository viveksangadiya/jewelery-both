'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck, Truck, CreditCard, Banknote, ChevronRight,
  MapPin, User, Phone, Check, Edit2, Package,
} from 'lucide-react';
import { useCartStore, useAuthStore, itemPrice } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

declare global { interface Window { Razorpay: any; } }

type Step = 1 | 2 | 3;
type PaymentMethod = 'razorpay' | 'cod';
type Salutation = 'Mrs/Ms' | 'Mr.';
type DeliveryOption = 'standard' | 'express';

interface Address {
  salutation: Salutation;
  name: string; phone: string;
  address_line1: string; address_line2: string;
  city: string; state: string; pincode: string;
}

// ── Stepper ───────────────────────────────────────────────
function CheckoutStepper({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Delivery' },
    { n: 2, label: 'Payment' },
    { n: 3, label: 'Review' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map(({ n, label }, i) => {
        const done    = step > n;
        const active  = step === n;
        const pending = step < n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 flex items-center justify-center text-[11px] font-medium transition-all"
                style={{
                  backgroundColor: done ? '#000' : active ? '#000' : 'transparent',
                  color: done || active ? '#fff' : '#999',
                  border: pending ? '1px solid #E0D9D0' : 'none',
                }}
              >
                {done ? <Check size={12} /> : n}
              </div>
              <span
                className="text-[9px] tracking-[0.15em] uppercase whitespace-nowrap"
                style={{ color: active ? '#000' : '#999' }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-16 sm:w-24 h-px mx-2 mb-4 transition-all"
                style={{ backgroundColor: done ? '#000' : '#E0D9D0' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Form field wrapper ────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">
        {label}{required && <span className="text-brand-text ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Shared input class ────────────────────────────────────
const inputCls = "w-full px-4 py-3 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors";

// ── Bag summary sidebar ───────────────────────────────────
function BagSummary({
  items, subtotal, shipping, discount, deliveryOption,
}: {
  items: any[]; subtotal: number; shipping: number; discount: number; deliveryOption: DeliveryOption;
}) {
  const deliveryFee = deliveryOption === 'express' ? 149 : shipping;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="border border-brand-border bg-white lg:sticky lg:top-6">
      <div className="px-5 py-4 border-b border-brand-border">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-brand-text">
          Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
        </p>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-4 max-h-56 overflow-y-auto scrollbar-hide border-b border-brand-border">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-14 flex-shrink-0 bg-brand-hover overflow-hidden">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-brand-text truncate">{item.name}</p>
              {(item as any).size_label && (
                <p className="text-[10px] text-brand-muted mt-0.5">Size: {(item as any).size_label}</p>
              )}
              <p className="text-[10px] text-brand-muted">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-brand-text flex-shrink-0">
              ₹{(itemPrice(item) * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="px-5 py-4 space-y-2.5 text-xs border-b border-brand-border">
        <div className="flex justify-between text-brand-secondary">
          <span>Subtotal</span>
          <span className="text-brand-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span className="font-medium">−₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-brand-secondary">
          <span>Delivery</span>
          <span className="text-brand-text font-medium">
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 flex justify-between items-baseline">
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-brand-text">Total</span>
        <span className="text-lg font-medium text-brand-text">₹{total.toLocaleString('en-IN')}</span>
      </div>

      <div className="px-5 pb-4 space-y-1.5">
        {['100% secure checkout', 'Free returns within 7 days'].map(note => (
          <p key={note} className="flex items-center gap-2 text-[10px] text-brand-muted">
            <span className="text-green-700">✓</span> {note}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function CheckoutPage(): JSX.Element {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);

  const [mounted, setMounted]             = useState(false);
  const [step, setStep]                   = useState<Step>(1);
  const [loading, setLoading]             = useState(false);

  // Address
  const [address, setAddress] = useState<Address>({
    salutation: 'Mrs/Ms',
    name: '', phone: '',
    address_line1: '', address_line2: '',
    city: '', state: 'Gujarat', pincode: '',
  });
  const [guestEmail, setGuestEmail]       = useState('');
  const [pincodeOk, setPincodeOk]         = useState<boolean | null>(null);
  const [eta, setEta]                     = useState('');
  const [otpConsent, setOtpConsent]       = useState(true);

  // Delivery
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('standard');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [billingSame, setBillingSame]     = useState(true);

  // Coupon (passed from cart page via query params)
  const [couponCode]  = useState(searchParams?.get('coupon') || '');
  const [discount]    = useState(Number(searchParams?.get('discount') || 0));

  const safeItems  = Array.isArray(items) ? items : [];
  const subtotal   = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const shipping   = subtotal >= 499 ? 0 : 99;
  const deliveryFee = deliveryOption === 'express' ? 149 : shipping;
  const total      = Math.round(subtotal - discount + deliveryFee);

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
    if (mounted && !user) setPaymentMethod('cod');
  }, [mounted, user, items]);

  const setAddr = (k: keyof Address, v: string) => setAddress(p => ({ ...p, [k]: v }));

  const checkPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    try {
      const res = await api.get(`/shiprocket/serviceability?pincode=${pin}`);
      const d = res.data.data;
      setPincodeOk(d.is_serviceable);
      if (d.is_serviceable) {
        setEta(d.estimated_delivery || '');
      } else {
        toast.error('Delivery not available at this pincode');
      }
    } catch { setPincodeOk(true); }
  };

  const validateAddress = (): boolean => {
    const { name, phone, address_line1, city, state, pincode } = address;
    if (!name || !phone || !address_line1 || !city || !state || !pincode) {
      toast.error('Please fill all required fields'); return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error('Enter a valid 10-digit mobile number'); return false; }
    if (!/^\d{6}$/.test(pincode))    { toast.error('Enter a valid 6-digit pincode'); return false; }
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
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        shipping_address: address,
        coupon_code: couponCode || undefined,
      });
      const { razorpay_order_id, amount, currency, key_id } = res.data.data;
      const options = {
        key: key_id, amount, currency,
        name: 'HastKala',
        description: 'Handmade Craft Order',
        order_id: razorpay_order_id,
        prefill: { name: address.name, contact: address.phone, email: user?.email || '' },
        theme: { color: '#000000' },
        handler: async (resp: any) => {
          try {
            const verify = await api.post('/payment/verify', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            if (verify.data.success) {
              clearCart();
              router.push(`/order-success?order=${verify.data.data.order_number}`);
            }
          } catch (e: any) {
            toast.error(e.response?.data?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); toast('Payment cancelled', { icon: '⚠️' }); },
        },
      };
      new window.Razorpay(options).open();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/cod-order', {
        shipping_address: address,
        coupon_code: couponCode || undefined,
      });
      clearCart();
      router.push(`/order-success?order=${res.data.data.order_number}&method=cod`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-8 h-8 border-2 border-brand-border border-t-brand-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg py-10">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6">

        {/* Logo / secure header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="font-display text-2xl text-brand-text">HastKala</a>
          <span className="flex items-center gap-1.5 text-xs text-brand-muted">
            <ShieldCheck size={13} className="text-brand-text" /> Secure Checkout
          </span>
        </div>

        {/* Stepper */}
        <CheckoutStepper step={step} />

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── LEFT: Steps ── */}
          <div className="space-y-5">

            {/* ══ STEP 1: Delivery ══ */}
            {step === 1 && (
              <div className="border border-brand-border bg-white">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-border">
                  <MapPin size={14} className="text-brand-muted" />
                  <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                    Delivery Details
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">

                  {/* Guest email */}
                  {!user && (
                    <div className="pb-5 border-b border-brand-border space-y-4">
                      <p className="text-xs text-brand-secondary">
                        Checking out as guest.{' '}
                        <a href="/account/login?redirect=/checkout" className="underline text-brand-text">
                          Sign in
                        </a>{' '}
                        for a faster experience.
                      </p>
                      <Field label="Email Address" required>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={e => setGuestEmail(e.target.value)}
                          className={inputCls}
                          placeholder="your@email.com"
                        />
                      </Field>
                    </div>
                  )}

                  {/* Salutation */}
                  <Field label="Title">
                    <div className="flex gap-2">
                      {(['Mrs/Ms', 'Mr.'] as Salutation[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setAddr('salutation', s)}
                          className="px-5 py-2.5 text-xs border transition-all"
                          style={{
                            borderColor: address.salutation === s ? '#000' : '#E0D9D0',
                            backgroundColor: address.salutation === s ? '#000' : 'transparent',
                            color: address.salutation === s ? '#fff' : '#999',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Name + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                      <input
                        value={address.name}
                        onChange={e => setAddr('name', e.target.value)}
                        className={inputCls}
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field label="Mobile Number" required>
                      <input
                        value={address.phone}
                        onChange={e => setAddr('phone', e.target.value)}
                        maxLength={10}
                        className={inputCls}
                        placeholder="10-digit mobile"
                      />
                    </Field>
                  </div>

                  {/* Address */}
                  <Field label="Address Line 1" required>
                    <input
                      value={address.address_line1}
                      onChange={e => setAddr('address_line1', e.target.value)}
                      className={inputCls}
                      placeholder="House No, Street, Area"
                    />
                  </Field>
                  <Field label="Address Line 2">
                    <input
                      value={address.address_line2}
                      onChange={e => setAddr('address_line2', e.target.value)}
                      className={inputCls}
                      placeholder="Landmark, Colony (optional)"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="City" required>
                      <input
                        value={address.city}
                        onChange={e => setAddr('city', e.target.value)}
                        className={inputCls}
                        placeholder="Ahmedabad"
                      />
                    </Field>
                    <Field label="Pincode" required>
                      <input
                        value={address.pincode}
                        onChange={e => {
                          setAddr('pincode', e.target.value);
                          if (e.target.value.length === 6) checkPincode(e.target.value);
                        }}
                        maxLength={6}
                        className={inputCls}
                        style={{
                          borderColor: pincodeOk === true ? '#2d7a2d' : pincodeOk === false ? '#b91c1c' : undefined,
                        }}
                        placeholder="380001"
                      />
                      {pincodeOk && eta && (
                        <p className="text-[10px] mt-1 flex items-center gap-1 text-green-700">
                          <Truck size={11} /> Est: {eta}
                        </p>
                      )}
                    </Field>
                    <Field label="State" required>
                      <select
                        value={address.state}
                        onChange={e => setAddr('state', e.target.value)}
                        className={inputCls + ' appearance-none'}
                      >
                        {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Delivery options */}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-3">
                      Delivery Method
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          key: 'standard' as DeliveryOption,
                          label: 'Standard Delivery',
                          sub: '3–5 business days',
                          price: shipping === 0 ? 'Free' : '₹99',
                          icon: Truck,
                        },
                        {
                          key: 'express' as DeliveryOption,
                          label: 'Express Delivery',
                          sub: '1–2 business days',
                          price: '₹149',
                          icon: Package,
                        },
                      ].map(opt => (
                        <label
                          key={opt.key}
                          className="flex items-center gap-4 p-4 cursor-pointer border transition-all"
                          style={{
                            borderColor: deliveryOption === opt.key ? '#000' : '#E0D9D0',
                            backgroundColor: deliveryOption === opt.key ? '#F5F0EB' : 'white',
                          }}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryOption === opt.key}
                            onChange={() => setDeliveryOption(opt.key)}
                            className="accent-black flex-shrink-0"
                          />
                          <opt.icon size={16} className="text-brand-muted flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-text">{opt.label}</p>
                            <p className="text-[11px] text-brand-muted">{opt.sub}</p>
                          </div>
                          <span className="text-sm font-medium text-brand-text">{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* OTP consent */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={otpConsent}
                      onChange={e => setOtpConsent(e.target.checked)}
                      className="mt-0.5 accent-black flex-shrink-0"
                    />
                    <span className="text-xs text-brand-secondary leading-relaxed">
                      I consent to receive OTP from the delivery carrier for shipment tracking and delivery confirmation.
                    </span>
                  </label>

                  <button
                    onClick={() => { if (validateAddress()) setStep(2); }}
                    className="btn-brand w-full h-12"
                  >
                    Continue to Payment <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 2: Payment ══ */}
            {step === 2 && (
              <div className="border border-brand-border bg-white">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-border">
                  <CreditCard size={14} className="text-brand-muted" />
                  <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                    Payment Method
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">

                  {/* Delivery address summary */}
                  <div className="flex items-start justify-between p-4 bg-brand-hover border border-brand-border">
                    <div>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-brand-muted mb-1">
                        Delivering to
                      </p>
                      <p className="text-sm font-medium text-brand-text">
                        {address.salutation} {address.name} · {address.phone}
                      </p>
                      <p className="text-xs text-brand-secondary mt-0.5">
                        {address.address_line1}, {address.city}, {address.state} – {address.pincode}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-[10px] tracking-wide text-brand-muted hover:text-brand-text transition-colors flex-shrink-0 ml-3"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  </div>

                  {/* Guest notice */}
                  {!user && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-brand-hover border border-brand-border text-xs text-brand-secondary">
                      <Banknote size={13} className="text-brand-text flex-shrink-0" />
                      Guest orders are Cash on Delivery only.{' '}
                      <a href="/account/login?redirect=/checkout" className="underline text-brand-text">Sign in</a>
                      {' '}to pay online.
                    </div>
                  )}

                  {/* Payment options */}
                  <div className="space-y-2">
                    {([
                      {
                        value: 'razorpay' as PaymentMethod,
                        icon: CreditCard,
                        title: 'Pay Online',
                        subtitle: 'UPI, Cards, Net Banking, Wallets — via Razorpay',
                        badges: ['UPI', 'Visa', 'Mastercard'],
                        guestHidden: true,
                      },
                      {
                        value: 'cod' as PaymentMethod,
                        icon: Banknote,
                        title: 'Cash on Delivery',
                        subtitle: 'Pay when your order arrives',
                        badges: [],
                        guestHidden: false,
                      },
                    ] as Array<{ value: PaymentMethod; icon: any; title: string; subtitle: string; badges: string[]; guestHidden: boolean }>)
                    .filter(opt => !(!user && opt.guestHidden))
                    .map(opt => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-4 p-4 cursor-pointer border transition-all"
                        style={{
                          borderColor: paymentMethod === opt.value ? '#000' : '#E0D9D0',
                          backgroundColor: paymentMethod === opt.value ? '#F5F0EB' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)}
                          className="accent-black flex-shrink-0"
                        />
                        <opt.icon
                          size={16}
                          className={paymentMethod === opt.value ? 'text-brand-text' : 'text-brand-muted'}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-text">{opt.title}</p>
                          <p className="text-[11px] text-brand-muted">{opt.subtitle}</p>
                        </div>
                        {opt.badges.length > 0 && (
                          <div className="flex gap-1">
                            {opt.badges.map(b => (
                              <span
                                key={b}
                                className="text-[9px] px-1.5 py-0.5 border border-brand-border text-brand-muted"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Billing address toggle */}
                  <div className="pt-2">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-3">
                      Billing Address
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={e => setBillingSame(e.target.checked)}
                        className="accent-black"
                      />
                      <span className="text-sm text-brand-text">Same as shipping address</span>
                    </label>
                    {!billingSame && (
                      <div className="p-4 border border-brand-border bg-brand-hover text-xs text-brand-secondary">
                        Billing address form would appear here.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-brand-outline h-12 px-6 text-[11px]"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="btn-brand flex-1 h-12"
                    >
                      Review Order <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Review ══ */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Delivery summary */}
                <div className="border border-brand-border bg-white">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-brand-text">
                      Delivery
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-[10px] tracking-wide text-brand-muted hover:text-brand-text transition-colors"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  </div>
                  <div className="px-6 py-4 text-sm space-y-1">
                    <p className="font-medium text-brand-text">
                      {address.salutation} {address.name} · {address.phone}
                    </p>
                    <p className="text-brand-secondary">
                      {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}
                    </p>
                    <p className="text-brand-secondary">
                      {address.city}, {address.state} – {address.pincode}
                    </p>
                    <p className="text-brand-muted text-xs mt-1">
                      {deliveryOption === 'standard' ? 'Standard Delivery (3–5 days)' : 'Express Delivery (1–2 days)'}
                    </p>
                  </div>
                </div>

                {/* Payment summary */}
                <div className="border border-brand-border bg-white">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-brand-text">
                      Payment
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1 text-[10px] tracking-wide text-brand-muted hover:text-brand-text transition-colors"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  </div>
                  <div className="px-6 py-4 text-sm">
                    <p className="text-brand-text font-medium">
                      {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                    </p>
                    <p className="text-brand-muted text-xs mt-0.5">
                      {billingSame ? 'Billing address same as shipping' : 'Custom billing address'}
                    </p>
                  </div>
                </div>

                {/* T&C + Buy Now */}
                <div className="border border-brand-border bg-white px-6 py-6 space-y-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-black flex-shrink-0" />
                    <span className="text-xs text-brand-secondary leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="underline text-brand-text">Terms & Conditions</a>,{' '}
                      <a href="/privacy" className="underline text-brand-text">Privacy Policy</a>, and{' '}
                      <a href="/returns" className="underline text-brand-text">Return Policy</a>.
                    </span>
                  </label>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-brand w-full h-14 text-[12px] tracking-[0.2em]"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={15} />
                        {paymentMethod === 'cod'
                          ? 'Place Order (COD)'
                          : `Buy Now — ₹${total.toLocaleString('en-IN')}`
                        }
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-brand-muted">
                    🔒 Secured by {paymentMethod === 'razorpay' ? 'Razorpay' : '256-bit SSL'}
                  </p>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full text-center text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
                  >
                    Back to Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Bag summary ── */}
          <BagSummary
            items={safeItems}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            deliveryOption={deliveryOption}
          />
        </div>
      </div>
    </div>
  );
}
