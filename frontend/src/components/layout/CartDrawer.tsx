'use client';
import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, itemPrice } from '@/lib/store';
import { cartApi, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CartDrawer(): JSX.Element | null {
  const { items, isOpen, closeCart, removeItem, updateQuantity, setItems } = useCartStore();
  const user = useAuthStore(s => s.user);

  const [couponCode, setCouponCode]         = useState('');
  const [couponApplied, setCouponApplied]   = useState(false);
  const [discount, setDiscount]             = useState(0);
  const [couponId, setCouponId]             = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [syncing, setSyncing]               = useState(false);

  const safeItems    = Array.isArray(items) ? items : [];
  const subtotal     = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const freeShipping = subtotal - discount >= 499;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal - discount + shipping;
  const itemCount    = safeItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!isOpen || !user) return;
    setSyncing(true);
    cartApi.get()
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [isOpen, user]);

  const handleRemove = async (id: number) => {
    removeItem(id);
    try {
      await cartApi.remove(id);
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch { toast.error('Failed to remove item'); }
  };

  const handleQty = async (id: number, qty: number) => {
    updateQuantity(id, qty);
    try {
      if (qty <= 0) await cartApi.remove(id);
      else          await cartApi.update(id, qty);
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch { toast.error('Failed to update'); }
  };

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
    setCouponApplied(false); setDiscount(0); setCouponId(null); setCouponCode('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col animate-slide-in-right bg-white"
        style={{ borderLeft: '1px solid #e1e1e1' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e1e1e1' }}>
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={17} style={{ color: '#1c1c1c' }} />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1c1c1c]">
              Your Cart {itemCount > 0 && `(${itemCount})`}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-[#9b9b9b] transition-colors hover:text-[#1c1c1c]"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Free shipping progress ── */}
        {subtotal > 0 && (
          <div className="px-6 py-3" style={{ borderBottom: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
            {freeShipping ? (
              <p className="text-xs font-medium text-[#347a07]">
                Free shipping unlocked!
              </p>
            ) : (
              <>
                <p className="text-xs mb-2 text-[#363636]">
                  Add <span className="font-bold text-[#1c1c1c]">₹{(499 - (subtotal - discount)).toFixed(0)}</span> more for free shipping
                </p>
                <div className="h-px w-full" style={{ backgroundColor: '#e1e1e1' }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((subtotal - discount) / 499) * 100, 100)}%`,
                      backgroundColor: '#1c1c1c',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {syncing ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#e1e1e1', borderTopColor: '#1c1c1c' }} />
            </div>
          ) : safeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-14 h-14 flex items-center justify-center mb-5" style={{ backgroundColor: '#f5f5f5' }}>
                <ShoppingBag size={26} style={{ color: '#9b9b9b' }} />
              </div>
              <p className="text-sm font-semibold mb-1 text-[#1c1c1c]">Your cart is empty</p>
              <p className="text-xs mb-8 text-[#9b9b9b]">Discover handcrafted torans &amp; decor</p>
              <button
                onClick={closeCart}
                className="btn-craft"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {safeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5"
                  style={{ borderBottom: idx < safeItems.length - 1 ? '1px solid #e1e1e1' : 'none' }}
                >
                  {/* Image */}
                  <div className="w-[68px] h-[68px] flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} style={{ color: '#9b9b9b' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold leading-snug truncate text-[#1c1c1c]">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex-shrink-0 mt-0.5 text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {(item as any).size_label && (
                      <p className="text-[10px] mt-0.5 tracking-wide text-[#9b9b9b]">
                        Size: {(item as any).size_label}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center" style={{ border: '1px solid #e1e1e1' }}>
                        <button
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-[#363636] transition-colors hover:bg-[#f5f5f5]"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#1c1c1c]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-[#363636] transition-colors hover:bg-[#f5f5f5]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#1c1c1c]">
                        ₹{(itemPrice(item) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer / Checkout panel ── */}
        {safeItems.length > 0 && (
          <div className="px-6 py-5 space-y-4 bg-white" style={{ borderTop: '1px solid #e1e1e1' }}>

            {/* Coupon */}
            {!couponApplied ? (
              <div className="flex gap-0">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5" style={{ border: '1px solid #e1e1e1', borderRight: 'none' }}>
                  <Tag size={11} style={{ color: '#9b9b9b' }} />
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 text-xs outline-none bg-transparent font-mono tracking-widest placeholder:normal-case placeholder:tracking-normal text-[#1c1c1c]"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 text-[10px] font-bold tracking-widest uppercase transition-colors disabled:opacity-40 text-[#1c1c1c] hover:bg-[#f5f5f5]"
                  style={{ border: '1px solid #e1e1e1' }}
                >
                  {applyingCoupon ? '…' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: '#f5f5f5' }}>
                <span className="text-xs font-bold tracking-wide text-[#1c1c1c]">✓ {couponCode} applied</span>
                <button onClick={removeCoupon} className="text-xs underline text-[#9b9b9b] hover:text-[#1c1c1c]">
                  Remove
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#363636]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1c1c1c]">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#363636]">
                  <span>Discount</span>
                  <span className="font-medium text-[#1c1c1c]">−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#363636]">
                <span>Shipping</span>
                <span className="font-medium text-[#1c1c1c]">{freeShipping ? 'FREE' : '₹99'}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #e1e1e1' }}>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1c1c1c]">Total</span>
              <span className="text-lg font-bold text-[#1c1c1c]">₹{total.toLocaleString()}</span>
            </div>

            {/* CTA */}
            <Link
              href={`/checkout${couponApplied ? `?coupon=${couponCode}&discount=${discount}` : ''}`}
              onClick={closeCart}
              className="btn-craft w-full"
            >
              Proceed to Checkout <ArrowRight size={13} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-[10px] tracking-widest uppercase text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
