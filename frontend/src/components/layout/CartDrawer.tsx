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

  const [couponCode, setCouponCode]       = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount]           = useState(0);
  const [couponId, setCouponId]           = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [syncing, setSyncing]             = useState(false);

  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    if (!isOpen || !user) return;
    setSyncing(true);
    cartApi.get()
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [isOpen, user]);

  const subtotal     = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const freeShipping = subtotal - discount >= 499;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal - discount + shipping;
  const itemCount    = safeItems.reduce((s, i) => s + i.quantity, 0);

  const handleRemove = async (id: number) => {
    removeItem(id);
    try {
      await cartApi.remove(id);
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleQty = async (id: number, qty: number) => {
    updateQuantity(id, qty);
    try {
      if (qty <= 0) { await cartApi.remove(id); }
      else          { await cartApi.update(id, qty); }
      const res = await cartApi.get();
      setItems(res.data.data);
    } catch {
      toast.error('Failed to update');
    }
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
    setCouponApplied(false);
    setDiscount(0);
    setCouponId(null);
    setCouponCode('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(100,35,8,0.35)' }} onClick={closeCart} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col animate-slide-in-right"
        style={{ backgroundColor: '#FAF9EE', borderLeft: '1px solid #EBEBCA' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #EBEBCA' }}>
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} style={{ color: '#903E1D' }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#642308' }}>
              Your Cart {itemCount > 0 && `(${itemCount})`}
            </span>
          </div>
          <button onClick={closeCart}
            className="flex items-center justify-center w-8 h-8 transition-colors"
            style={{ color: '#903E1D' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
            <X size={18} />
          </button>
        </div>

        {/* ── Free shipping bar ── */}
        {subtotal > 0 && (
          <div className="px-6 py-3" style={{ borderBottom: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
            {freeShipping ? (
              <p className="text-xs font-medium" style={{ color: '#642308' }}>
                🎉 You've unlocked free shipping!
              </p>
            ) : (
              <>
                <p className="text-xs mb-2" style={{ color: '#903E1D' }}>
                  Add <span className="font-bold">₹{(499 - (subtotal - discount)).toFixed(0)}</span> more for free shipping
                </p>
                <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: '#d4c9a0' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((subtotal - discount) / 499) * 100, 100)}%`,
                      backgroundColor: '#903E1D',
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
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#B68868', borderTopColor: 'transparent' }} />
            </div>
          ) : safeItems.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-16 h-16 flex items-center justify-center mb-5 rounded-full" style={{ backgroundColor: '#EBEBCA' }}>
                <ShoppingBag size={28} style={{ color: '#B68868' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#642308' }}>Your cart is empty</p>
              <p className="text-xs mb-8" style={{ color: '#B68868' }}>Discover handcrafted torans &amp; decor</p>
              <button
                onClick={closeCart}
                className="text-xs font-bold tracking-[0.2em] uppercase px-8 py-3 transition-colors"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {safeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5"
                  style={{ borderBottom: idx < safeItems.length - 1 ? '1px solid #EBEBCA' : 'none' }}
                >
                  {/* Image */}
                  <div className="w-[72px] h-[72px] flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#EBEBCA' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} style={{ color: '#B68868' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold leading-snug truncate" style={{ color: '#642308' }}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex-shrink-0 mt-0.5 transition-colors"
                        style={{ color: '#B68868' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {(item as any).size_label && (
                      <p className="text-[10px] mt-0.5 tracking-wide" style={{ color: '#B68868' }}>
                        Size: {(item as any).size_label}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center" style={{ border: '1px solid #EBEBCA' }}>
                        <button
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs transition-colors"
                          style={{ color: '#903E1D' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EBEBCA')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold" style={{ color: '#642308' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs transition-colors"
                          style={{ color: '#903E1D' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EBEBCA')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold" style={{ color: '#642308' }}>
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
          <div className="px-6 py-5 space-y-4" style={{ borderTop: '1px solid #EBEBCA', backgroundColor: '#FAF9EE' }}>

            {/* Coupon */}
            {!couponApplied ? (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5" style={{ border: '1px solid #EBEBCA' }}>
                  <Tag size={12} style={{ color: '#B68868' }} />
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 text-xs outline-none bg-transparent font-mono tracking-widest placeholder:normal-case placeholder:tracking-normal"
                    style={{ color: '#642308' }}
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#EBEBCA', color: '#642308' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d4c9a0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EBEBCA')}>
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: '#EBEBCA' }}>
                <span className="text-xs font-bold tracking-wide" style={{ color: '#642308' }}>
                  ✓ {couponCode} applied
                </span>
                <button onClick={removeCoupon} className="text-xs underline" style={{ color: '#903E1D' }}>
                  Remove
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs" style={{ color: '#903E1D' }}>
                <span>Subtotal</span>
                <span className="font-medium" style={{ color: '#642308' }}>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#903E1D' }}>Discount</span>
                  <span className="font-medium" style={{ color: '#642308' }}>−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs" style={{ color: '#903E1D' }}>
                <span>Shipping</span>
                <span className="font-medium" style={{ color: '#642308' }}>
                  {freeShipping ? 'FREE' : '₹99'}
                </span>
              </div>
            </div>

            {/* Total */}
            <div
              className="flex justify-between items-center pt-3"
              style={{ borderTop: '1px solid #EBEBCA' }}
            >
              <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#642308' }}>Total</span>
              <span className="text-lg font-bold" style={{ color: '#642308' }}>₹{total.toLocaleString()}</span>
            </div>

            {/* CTA */}
            <Link
              href={`/checkout${couponApplied ? `?coupon=${couponCode}&discount=${discount}` : ''}`}
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
              Proceed to Checkout <ArrowRight size={14} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs tracking-widest uppercase transition-colors"
              style={{ color: '#B68868' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
