'use client';
import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, itemPrice } from '@/lib/store';
import { cartApi, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CartDrawer(): JSX.Element | null {
  const { items, isOpen, closeCart, removeItem, updateQuantity, setItems } = useCartStore();
  const user = useAuthStore(s => s.user);

  const [couponCode, setCouponCode]       = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount]           = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [syncing, setSyncing]             = useState(false);

  const safeItems    = Array.isArray(items) ? items : [];
  const subtotal     = safeItems.reduce((s, i) => s + itemPrice(i) * i.quantity, 0);
  const freeShipping = subtotal - discount >= 999;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal - discount + shipping;
  const freeLeft     = Math.max(0, 999 - (subtotal - discount));

  useEffect(() => {
    if (!isOpen || !user) return;
    setSyncing(true);
    cartApi.get().then(r => setItems(r.data.data)).catch(() => {}).finally(() => setSyncing(false));
  }, [isOpen, user]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = async (id: number) => {
    removeItem(id);
    try { await cartApi.remove(id); const r = await cartApi.get(); setItems(r.data.data); }
    catch { toast.error('Failed to remove'); }
  };

  const handleQty = async (id: number, qty: number) => {
    updateQuantity(id, qty);
    try {
      if (qty <= 0) await cartApi.remove(id); else await cartApi.update(id, qty);
      const r = await cartApi.get(); setItems(r.data.data);
    } catch { toast.error('Failed to update'); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await ordersApi.validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      setDiscount(res.data.data.discount);
      setCouponApplied(true);
      toast.success(`✦ Saved ₹${res.data.data.discount}!`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    } finally { setApplyingCoupon(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#FF4D4D]" strokeWidth={2.5} />
            <span className="font-sans font-bold text-lg text-jet">
              Your Bag ({safeItems.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button onClick={closeCart} className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666] hover:bg-[#E8E8E8] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal > 0 && !freeShipping && (
          <div className="px-5 py-3 bg-[#FFF3CC] border-b border-[#FFE580]">
            <p className="text-xs font-semibold text-jet flex items-center gap-1.5">
              <Zap size={12} fill="currentColor" className="text-[#FFB800]" />
              Add ₹{freeLeft.toLocaleString()} more for FREE shipping!
            </p>
            <div className="mt-2 h-1.5 bg-[#FFE580] rounded-full overflow-hidden">
              <div className="h-full bg-[#FFB800] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((subtotal - discount) / 999) * 100, 100)}%` }} />
            </div>
          </div>
        )}
        {freeShipping && subtotal > 0 && (
          <div className="px-5 py-2.5 bg-[#EDFFF4] border-b border-[#B7F0CC] text-xs font-semibold text-[#1a7f37] text-center">
            🎉 You've unlocked FREE shipping!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {syncing ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#FF4D4D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : safeItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="font-sans font-bold text-lg text-jet mb-1">Your bag is empty</p>
              <p className="text-sm text-[#999] mb-6">Add some beautiful jewelry!</p>
              <button onClick={closeCart}>
                <Link href="/shop" className="btn-coral px-6 py-2.5 text-sm">Start Shopping →</Link>
              </button>
            </div>
          ) : (
            safeItems.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">✦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-jet truncate">{item.name}</h4>
                  {(item as any).size_label && (
                    <p className="text-xs text-[#999] mt-0.5">Size: {(item as any).size_label}</p>
                  )}
                  <p className="text-sm font-bold text-[#FF4D4D] mt-1">
                    ₹{itemPrice(item).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-0 border border-[#E8E8E8] rounded-full overflow-hidden">
                      <button onClick={() => handleQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-jet hover:bg-[#F5F5F5] transition-colors text-sm font-bold">
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => handleQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-jet hover:bg-[#F5F5F5] transition-colors text-sm font-bold">
                        <Plus size={11} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.id)}
                      className="text-[#ccc] hover:text-[#FF4D4D] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {safeItems.length > 0 && (
          <div className="border-t border-[#E8E8E8] px-5 py-5 space-y-4 bg-white">
            {/* Coupon */}
            {!couponApplied ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E8E8E8] rounded-full text-xs font-mono focus:border-[#FF4D4D] outline-none bg-white"
                  />
                </div>
                <button onClick={applyCoupon} disabled={applyingCoupon}
                  className="btn-coral px-4 py-2 text-xs disabled:opacity-50 rounded-full">
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#EDFFF4] border border-[#B7F0CC] rounded-full px-4 py-2">
                <span className="text-xs font-bold text-[#1a7f37]">✦ {couponCode} applied!</span>
                <button onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(''); }}
                  className="text-xs text-[#FF4D4D] font-semibold">Remove</button>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal</span><span className="font-medium text-jet">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1a7f37]">
                  <span>Discount</span><span className="font-bold">−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#666]">
                <span>Shipping</span>
                <span className={freeShipping ? 'text-[#1a7f37] font-bold' : 'text-jet font-medium'}>
                  {freeShipping ? 'FREE' : '₹99'}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-sans font-extrabold text-xl border-t border-[#E8E8E8] pt-3">
              <span>Total</span>
              <span className="text-[#FF4D4D]">₹{total.toLocaleString()}</span>
            </div>

            <Link href={`/checkout${couponApplied ? `?coupon=${couponCode}&discount=${discount}` : ''}`}
              onClick={closeCart}
              className="btn-coral w-full py-4 text-sm font-bold text-center rounded-full block">
              Checkout →
            </Link>
            <button onClick={closeCart}
              className="w-full text-center text-sm text-[#999] hover:text-jet transition-colors font-medium">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
