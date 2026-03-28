'use client';
import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, itemPrice } from '@/lib/store';
import { cartApi, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CartDrawer(): JSX.Element | null {
  const { items, isOpen, closeCart, removeItem, updateQuantity, setItems } = useCartStore();
  const user = useAuthStore(s => s.user);

  const [couponCode, setCouponCode]     = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount]         = useState(0);
  const [couponId, setCouponId]         = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [syncing, setSyncing]           = useState(false);

  // Safe items array
  const safeItems = Array.isArray(items) ? items : [];

  // Fetch from server when drawer opens
  useEffect(() => {
    if (!isOpen || !user) return;
    setSyncing(true);
    cartApi.get()
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [isOpen, user]);

  // Totals
  const subtotal     = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const freeShipping = subtotal - discount >= 999;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal - discount + shipping;

  // Remove item — calls API then syncs
  const handleRemove = async (id: number) => {
    removeItem(id); // optimistic
    try {
      await cartApi.remove(id);
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  // Update quantity — calls API then syncs
  const handleQty = async (id: number, qty: number) => {
    updateQuantity(id, qty); // optimistic
    try {
      if (qty <= 0) {
        await cartApi.remove(id);
      } else {
        await cartApi.update(id, qty);
      }
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch {
      toast.error('Failed to update');
    }
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await ordersApi.validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      setDiscount(res.data.data.discount);
      setCouponId(res.data.data.coupon_id);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${res.data.data.discount}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    } finally { setApplyingCoupon(false); }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setDiscount(0);
    setCouponId(null);
    setCouponCode('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-yellow-600" />
            <h2 className="font-display font-semibold text-lg">
              Your Cart ({safeItems.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button onClick={closeCart} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {!freeShipping && subtotal > 0 && (
          <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
            <p className="text-xs text-yellow-800">
              Add <span className="font-semibold">₹{(999 - (subtotal - discount)).toFixed(0)}</span> more for free shipping! 🚚
            </p>
            <div className="mt-1.5 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${Math.min(((subtotal - discount) / 999) * 100, 100)}%` }} />
            </div>
          </div>
        )}
        {freeShipping && subtotal > 0 && (
          <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700 font-medium text-center">
            🎉 You've unlocked free shipping!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {syncing ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : safeItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add some beautiful jewelry!</p>
              <button onClick={closeCart}
                className="mt-6 btn-gold px-6 py-2.5 rounded-full text-sm font-medium">
                Continue Shopping
              </button>
            </div>
          ) : (
            safeItems.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                  {(item as any).size_label && (
                    <p className="text-xs text-gray-400 mt-0.5">Size: {(item as any).size_label}</p>
                  )}
                  <p className="text-yellow-600 font-semibold mt-1">
                    ₹{itemPrice(item).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => handleQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.id)}
                      className="p-1 hover:text-red-500 text-gray-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {safeItems.length > 0 && (
          <div className="border-t px-5 py-5 space-y-3 bg-gray-50">
            {/* Coupon */}
            {!couponApplied ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Coupon code"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-yellow-400 font-mono bg-white"
                  />
                </div>
                <button onClick={applyCoupon} disabled={applyingCoupon}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors">
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-green-700 text-xs font-semibold">✅ {couponCode} applied</span>
                <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
            )}

            {/* Pricing breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={freeShipping ? 'text-green-600 font-medium' : 'text-gray-700'}>
                  {freeShipping ? 'FREE' : '₹99'}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-yellow-700">₹{total.toLocaleString()}</span>
            </div>

            <Link
              href={`/checkout${couponApplied ? `?coupon=${couponCode}&discount=${discount}` : ''}`}
              onClick={closeCart}
              className="block btn-gold text-center py-3.5 rounded-xl font-semibold text-base">
              Proceed to Checkout →
            </Link>
            <button onClick={closeCart}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
