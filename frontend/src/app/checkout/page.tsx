'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, Banknote, ChevronRight, Tag, MapPin, User, Phone } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Address {
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
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

export default function CheckoutPage(): JSX.Element {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<Address>({
    name: '', phone: '', address_line1: '', address_line2: '', city: '', state: 'Gujarat', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eta, setEta] = useState('');
  const [pincodeOk, setPincodeOk] = useState<boolean | null>(null);

  const subtotal = getTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = Math.round(subtotal - discount + shipping);

  useEffect(() => {
    setMounted(true);
    setAddress((p) => ({ ...p, name: user?.name || '', phone: user?.phone || '' }));
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [user]);

  useEffect(() => {
    if (mounted && !user) router.push('/account/login?redirect=/checkout');
    if (mounted && items.length === 0) router.push('/shop');
  }, [mounted, user, items]);

  const set = (k: keyof Address, v: string) => setAddress((p) => ({ ...p, [k]: v }));

  const checkPincode = async (pin: string): Promise<void> => {
    if (pin.length !== 6) return;
    try {
      const res = await api.get(`/shiprocket/serviceability?pincode=${pin}`);
      const d = res.data.data;
      setPincodeOk(d.is_serviceable);
      if (d.is_serviceable) {
        setEta(d.estimated_delivery || '');
        toast.success(`Delivery available${d.estimated_delivery ? ` by ${d.estimated_delivery}` : ''}! ✅`);
      } else {
        toast.error('Delivery not available at this pincode');
      }
    } catch { setPincodeOk(true); }
  };

  const applyCoupon = async (): Promise<void> => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/orders/validate-coupon', { code: couponCode, subtotal });
      setDiscount(res.data.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${res.data.data.discount} 🎉`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    }
  };

  const validateAddress = (): boolean => {
    const { name, phone, address_line1, city, state, pincode } = address;
    if (!name || !phone || !address_line1 || !city || !state || !pincode) {
      toast.error('Please fill all required fields'); return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error('Enter a valid 10-digit mobile number'); return false; }
    if (!/^\d{6}$/.test(pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (paymentMethod === 'razorpay') {
      await handleRazorpay();
    } else {
      await handleCOD();
    }
  };

  const handleRazorpay = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        shipping_address: address,
        coupon_code: couponApplied ? couponCode : undefined,
      });
      const { razorpay_order_id, amount, currency, key_id } = res.data.data;

      const options = {
        key: key_id,
        amount, currency,
        name: 'Lumière Jewels',
        description: 'Fine Jewelry Order',
        order_id: razorpay_order_id,
        prefill: { name: address.name, contact: address.phone, email: user?.email || '' },
        theme: { color: '#d4901a' },
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
        modal: { ondismiss: () => { setLoading(false); toast('Payment cancelled', { icon: '⚠️' }); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCOD = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.post('/payment/cod-order', {
        shipping_address: address,
        coupon_code: couponApplied ? couponCode : undefined,
      });
      clearCart();
      router.push(`/order-success?order=${res.data.data.order_number}&method=cod`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-display">Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><ShieldCheck size={14} className="text-green-500" /> Secure checkout</span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {['Delivery Address', 'Payment'].map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > idx ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > idx ? '✓' : idx + 1}
              </div>
              <span className={`text-sm font-medium ${step === idx + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              {idx < 1 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-yellow-600" />
                  <h2 className="font-semibold text-gray-900">Delivery Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={address.name} onChange={(e) => set('name', e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400" placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile *</label>
                    <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={address.phone} onChange={(e) => set('phone', e.target.value)} maxLength={10} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400" placeholder="10-digit mobile" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Address Line 1 *</label>
                    <input value={address.address_line1} onChange={(e) => set('address_line1', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400" placeholder="House No, Street, Area" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Address Line 2</label>
                    <input value={address.address_line2} onChange={(e) => set('address_line2', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400" placeholder="Landmark, Colony (optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City *</label>
                    <input value={address.city} onChange={(e) => set('city', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pincode *</label>
                    <input
                      value={address.pincode}
                      onChange={(e) => { set('pincode', e.target.value); if (e.target.value.length === 6) checkPincode(e.target.value); }}
                      maxLength={6}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${pincodeOk === true ? 'border-green-400' : pincodeOk === false ? 'border-red-400' : 'border-gray-200 focus:border-yellow-400'}`}
                      placeholder="400001"
                    />
                    {pincodeOk && eta && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Truck size={11} /> Est. delivery: {eta}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">State *</label>
                    <select value={address.state} onChange={(e) => set('state', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400">
                      {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => { if (validateAddress()) setStep(2); }} className="mt-6 w-full btn-gold py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={18} className="text-yellow-600" />
                  <h2 className="font-semibold text-gray-900">Payment Method</h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivering to</p>
                    <p className="text-sm font-semibold text-gray-900">{address.name} · {address.phone}</p>
                    <p className="text-xs text-gray-500">{address.address_line1}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-yellow-700 font-semibold hover:underline whitespace-nowrap ml-3">Change</button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      value: 'razorpay' as PaymentMethod,
                      icon: CreditCard,
                      iconColor: 'text-blue-600',
                      title: 'Pay Online',
                      subtitle: 'UPI, Cards, Net Banking, Wallets — via Razorpay',
                      badges: ['UPI', 'Visa', 'Mastercard'],
                    },
                    {
                      value: 'cod' as PaymentMethod,
                      icon: Banknote,
                      iconColor: 'text-green-600',
                      title: 'Cash on Delivery',
                      subtitle: 'Pay when your order arrives',
                      badges: [],
                    },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-yellow-500" />
                      <opt.icon size={20} className={opt.iconColor} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{opt.title}</p>
                        <p className="text-xs text-gray-500">{opt.subtitle}</p>
                      </div>
                      {opt.badges.length > 0 && (
                        <div className="flex gap-1">
                          {opt.badges.map((b) => <span key={b} className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-medium">{b}</span>)}
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                <button onClick={handlePlaceOrder} disabled={loading} className="mt-6 w-full btn-gold py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    : <><ShieldCheck size={18} /> {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${total.toLocaleString()}`}</>
                  }
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">🔒 Secured by {paymentMethod === 'razorpay' ? 'Razorpay' : '256-bit SSL'}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {!couponApplied ? (
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code" className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-yellow-400 font-mono" />
                  </div>
                  <button onClick={applyCoupon} className="px-3 py-2 bg-yellow-500 text-white rounded-xl text-xs font-semibold hover:bg-yellow-600">Apply</button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
                  <span className="text-green-700 font-semibold">✅ {couponCode} applied</span>
                  <button onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(''); }} className="text-red-500 hover:underline">Remove</button>
                </div>
              )}

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shipping}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-yellow-700">₹{total.toLocaleString()}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400"><ShieldCheck size={13} className="text-green-500" /> 100% Secure Payments</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Truck size={13} className="text-green-500" /> Shipped via Shiprocket</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
