'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Plus, Minus, ShoppingBag, Heart, Tag, ChevronLeft, ChevronRight, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore, useWishlistStore, useAuthStore, itemPrice } from '@/lib/store';
import { cartApi, ordersApi, productsApi } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

// Payment logo SVGs as simple text marks
const PAYMENT_METHODS = ['Visa', 'Mastercard', 'UPI', 'Razorpay', 'COD'];

// ── "You May Also Like" carousel ────────────────────────────
function SuggestedCarousel({ products }: { products: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };
  if (!products.length) return null;
  return (
    <div className="border-t border-brand-border pt-12 mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-1">Discover More</p>
          <h2 className="font-display text-2xl font-normal text-brand-text">You May Also Like</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 flex items-center justify-center border border-brand-border hover:border-brand-text transition-colors"
          >
            <ChevronLeft size={14} className="text-brand-text" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 flex items-center justify-center border border-brand-border hover:border-brand-text transition-colors"
          >
            <ChevronRight size={14} className="text-brand-text" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {products.map((p: any) => (
          <div key={p.id} className="flex-shrink-0 w-[220px] sm:w-[240px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const user   = useAuthStore(s => s.user);
  const { items, setItems, removeItem, updateQuantity } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const [loading, setLoading]               = useState(true);
  const [suggested, setSuggested]           = useState<any[]>([]);

  // Gift options
  const [giftPackaging, setGiftPackaging]   = useState(false);
  const [giftNote, setGiftNote]             = useState(false);
  const [giftNoteText, setGiftNoteText]     = useState('');
  const [giftReceipt, setGiftReceipt]       = useState(false);

  // Promo code
  const [couponCode, setCouponCode]         = useState('');
  const [couponApplied, setCouponApplied]   = useState(false);
  const [discount, setDiscount]             = useState(0);
  const [couponId, setCouponId]             = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const GIFT_PACKAGING_FEE = 290;

  const safeItems    = Array.isArray(items) ? items : [];
  const subtotal     = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const giftFee      = giftPackaging ? GIFT_PACKAGING_FEE : 0;
  const freeShipping = subtotal - discount >= 499;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal + giftFee - discount + shipping;
  const itemCount    = safeItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    cartApi.get()
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // load suggestions
    productsApi.getAll({ limit: 12, is_featured: true } as any)
      .then(res => setSuggested(res.data.data || []))
      .catch(() => {});
  }, [user]);

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

  const checkoutHref = `/checkout${couponApplied ? `?coupon=${couponCode}&discount=${discount}` : ''}`;

  // ── Not logged in ──
  if (!loading && !user) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <ShoppingBag size={40} className="text-brand-border mx-auto mb-4" />
        <h2 className="font-display text-2xl text-brand-text mb-2">Sign in to view your bag</h2>
        <p className="text-sm text-brand-muted mb-8">Your cart is saved when you're logged in</p>
        <Link href="/account/login" className="btn-brand px-10 h-12">Sign In</Link>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="h-6 skeleton w-48 mb-10 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-24 h-32 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-3 w-3/5 rounded" />
                  <div className="skeleton h-3 w-2/5 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton h-64 rounded" />
        </div>
      </div>
    </div>
  );

  // ── Empty cart ──
  if (safeItems.length === 0) return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-10">
          <Link href="/" className="hover:text-brand-text transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-text">Shopping Bag</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-brand-hover mb-6">
            <ShoppingBag size={28} className="text-brand-muted" />
          </div>
          <h2 className="font-display text-3xl text-brand-text mb-2">Your bag is empty</h2>
          <p className="text-sm text-brand-muted mb-8">Discover our handcrafted collections</p>
          <Link href="/shop" className="btn-brand px-10 h-12">Continue Shopping</Link>
        </div>
        <SuggestedCarousel products={suggested} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-8">
          <Link href="/" className="hover:text-brand-text transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-text">Shopping Bag ({itemCount})</span>
        </nav>

        <h1 className="font-display text-3xl font-normal text-brand-text mb-8">Shopping Bag</h1>

        {/* Free shipping bar */}
        {!freeShipping && (
          <div className="mb-6 px-5 py-3 bg-brand-hover border border-brand-border flex items-center justify-between gap-4">
            <p className="text-xs text-brand-secondary">
              Add <span className="font-medium text-brand-text">₹{(499 - (subtotal - discount)).toFixed(0)}</span> more for free shipping
            </p>
            <div className="flex-1 max-w-[200px] h-px bg-brand-border">
              <div
                className="h-full bg-brand-text transition-all duration-500"
                style={{ width: `${Math.min(((subtotal - discount) / 499) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {freeShipping && (
          <div className="mb-6 px-5 py-3 bg-brand-hover border border-brand-border">
            <p className="text-xs font-medium text-green-700">Free shipping unlocked on this order</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ── LEFT: Cart items + gift options ── */}
          <div>
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 pb-3 border-b border-brand-border mb-1">
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-muted">Product</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-muted w-24 text-center">Quantity</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-muted w-20 text-right">Total</span>
            </div>

            {/* Items */}
            <div>
              {safeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-6 border-b border-brand-border"
                >
                  <div className="flex gap-5">
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                      <div className="w-24 h-32 bg-white overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-hover">
                            <ShoppingBag size={20} className="text-brand-muted" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-sm font-medium text-brand-text hover:text-brand-secondary transition-colors leading-snug block"
                          >
                            {item.name}
                          </Link>
                          {(item as any).size_label && (
                            <p className="text-[11px] text-brand-muted mt-0.5">
                              Size: {(item as any).size_label}
                            </p>
                          )}
                          <p className="text-sm font-medium text-brand-text mt-1">
                            ₹{itemPrice(item).toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Actions: wishlist + remove */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggle(item.product_id)}
                            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                            title={isWishlisted(item.product_id) ? 'Remove from wishlist' : 'Save for later'}
                          >
                            <Heart
                              size={14}
                              fill={isWishlisted(item.product_id) ? 'currentColor' : 'none'}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Qty + line total */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-brand-border">
                          <button
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-9 text-center text-sm font-medium text-brand-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-brand-text">
                          ₹{(itemPrice(item) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Gift Options ── */}
            <div className="mt-8 border border-brand-border">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-border bg-brand-hover">
                <Gift size={14} className="text-brand-muted flex-shrink-0" />
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-brand-text">
                  Gift Options
                </p>
              </div>

              <div className="divide-y divide-brand-border">
                {/* Gift packaging */}
                <label className="flex items-start gap-4 px-5 py-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={giftPackaging}
                    onChange={e => setGiftPackaging(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-brand-text group-hover:text-brand-secondary transition-colors">
                        Gift packaging
                      </span>
                      <span className="text-sm font-medium text-brand-text flex-shrink-0">
                        +₹{GIFT_PACKAGING_FEE.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Premium gift box with ribbon and tissue paper
                    </p>
                  </div>
                </label>

                {/* Gift note */}
                <label className="flex items-start gap-4 px-5 py-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={giftNote}
                    onChange={e => setGiftNote(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-brand-text group-hover:text-brand-secondary transition-colors">
                        Gift note
                      </span>
                      <span className="text-sm text-brand-muted flex-shrink-0">Free</span>
                    </div>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Personal message included with your order
                    </p>
                    {giftNote && (
                      <textarea
                        value={giftNoteText}
                        onChange={e => setGiftNoteText(e.target.value.slice(0, 200))}
                        placeholder="Write your message here…"
                        rows={3}
                        onClick={e => e.preventDefault()}
                        className="mt-3 w-full px-3 py-2.5 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors resize-none"
                      />
                    )}
                    {giftNote && (
                      <p className="text-[9px] text-right text-brand-muted mt-1 font-mono">
                        {giftNoteText.length}/200
                      </p>
                    )}
                  </div>
                </label>

                {/* Gift receipt */}
                <label className="flex items-start gap-4 px-5 py-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={giftReceipt}
                    onChange={e => setGiftReceipt(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-brand-text group-hover:text-brand-secondary transition-colors">
                        Digital gift receipt
                      </span>
                      <span className="text-sm text-brand-muted flex-shrink-0">Free</span>
                    </div>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Prices are hidden from the recipient
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:sticky lg:top-6">
            <div className="border border-brand-border bg-white">
              <div className="px-6 py-5 border-b border-brand-border">
                <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                  Order Summary
                </h2>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Promo code */}
                {!couponApplied ? (
                  <div>
                    <div className="flex gap-0">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 border border-brand-border border-r-0">
                        <Tag size={11} className="text-brand-muted flex-shrink-0" />
                        <input
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                          placeholder="Promo code"
                          className="flex-1 text-xs outline-none bg-transparent font-mono tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-brand-muted text-brand-text"
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="btn-brand px-4 text-[10px] h-auto py-2.5 disabled:opacity-40"
                      >
                        {applyingCoupon ? '…' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-brand-hover border border-brand-border">
                    <span className="text-xs font-medium text-brand-text">
                      ✓ {couponCode} applied
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs underline text-brand-muted hover:text-brand-text transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Price lines */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-brand-secondary">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="text-brand-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {giftPackaging && (
                    <div className="flex justify-between text-brand-secondary">
                      <span>Gift packaging</span>
                      <span className="text-brand-text font-medium">+₹{GIFT_PACKAGING_FEE.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount ({couponCode})</span>
                      <span className="font-medium">−₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-secondary">
                    <span>Shipping</span>
                    <span className="text-brand-text font-medium">
                      {freeShipping ? 'FREE' : '₹99'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-brand-border flex justify-between items-baseline">
                  <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-brand-text">
                    Total
                  </span>
                  <span className="text-xl font-medium text-brand-text">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={checkoutHref}
                  className="btn-brand w-full h-12 text-[11px]"
                >
                  Continue to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block text-center text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
                >
                  Continue Shopping
                </Link>

                {/* Payment logos */}
                <div className="pt-4 border-t border-brand-border">
                  <p className="text-[9px] tracking-[0.15em] uppercase text-brand-muted mb-3 text-center">
                    Accepted Payments
                  </p>
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    {PAYMENT_METHODS.map(method => (
                      <span
                        key={method}
                        className="px-2.5 py-1 border border-brand-border text-[9px] font-medium tracking-wide text-brand-muted"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Trust notes */}
                <div className="pt-3 space-y-1.5">
                  {[
                    '100% secure checkout',
                    'Free returns within 7 days',
                    'Authentic handcrafted products',
                  ].map(note => (
                    <p key={note} className="flex items-center gap-2 text-[10px] text-brand-muted">
                      <span className="text-green-700 text-[10px]">✓</span> {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        <SuggestedCarousel products={suggested} />
      </div>
    </div>
  );
}
