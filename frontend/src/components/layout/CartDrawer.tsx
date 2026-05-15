'use client';
import { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, itemPrice } from '@/lib/store';
import { cartApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CartDrawer(): JSX.Element | null {
  const { items, isOpen, closeCart, removeItem, updateQuantity, setItems } = useCartStore();
  const user = useAuthStore(s => s.user);

  const safeItems    = Array.isArray(items) ? items : [];
  const subtotal     = safeItems.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const freeShipping = subtotal >= 499;
  const shipping     = freeShipping ? 0 : 99;
  const total        = subtotal + shipping;
  const itemCount    = safeItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!isOpen || !user) return;
    cartApi.get()
      .then(res => setItems(res.data.data))
      .catch(() => {});
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col animate-slide-in-right bg-white border-l border-brand-border">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} className="text-brand-text" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-brand-text">
              Shopping Bag{itemCount > 0 ? ` (${itemCount})` : ''}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal > 0 && (
          <div className="px-6 py-3 border-b border-brand-border bg-brand-hover">
            {freeShipping ? (
              <p className="text-xs text-green-700 font-medium">Free shipping unlocked</p>
            ) : (
              <>
                <p className="text-xs mb-2 text-brand-secondary">
                  Add <span className="font-medium text-brand-text">₹{(499 - subtotal).toFixed(0)}</span> more for free shipping
                </p>
                <div className="h-px w-full bg-brand-border">
                  <div
                    className="h-full bg-brand-text transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {safeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-hover mb-5">
                <ShoppingBag size={24} className="text-brand-muted" />
              </div>
              <p className="text-sm font-medium mb-1 text-brand-text">Your bag is empty</p>
              <p className="text-xs mb-8 text-brand-muted">Discover handcrafted collections</p>
              <button onClick={closeCart} className="btn-brand h-11 px-8">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div>
              {safeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5"
                  style={{ borderBottom: idx < safeItems.length - 1 ? '1px solid #E0D9D0' : 'none' }}
                >
                  {/* Image */}
                  <Link href={`/product/${item.slug}`} onClick={closeCart} className="flex-shrink-0">
                    <div className="w-16 h-20 bg-white overflow-hidden border border-brand-border">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-hover">
                          <ShoppingBag size={16} className="text-brand-muted" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs font-medium leading-snug text-brand-text hover:text-brand-secondary transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors mt-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {(item as any).size_label && (
                      <p className="text-[10px] mt-0.5 text-brand-muted">
                        Size: {(item as any).size_label}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-brand-border">
                        <button
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors hover:bg-brand-hover"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-brand-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors hover:bg-brand-hover"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-brand-text">
                        ₹{(itemPrice(item) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {safeItems.length > 0 && (
          <div className="px-6 py-5 space-y-4 bg-white border-t border-brand-border">
            {/* Price breakdown */}
            <div className="space-y-2 text-xs text-brand-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-brand-text">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-brand-text">{freeShipping ? 'FREE' : '₹99'}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-3 border-t border-brand-border">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-brand-text">Total</span>
              <span className="text-lg font-medium text-brand-text">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {/* View bag CTA */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-brand w-full h-12"
            >
              View Bag & Checkout <ArrowRight size={13} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
