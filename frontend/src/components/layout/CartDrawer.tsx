'use client';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import type { CartItem } from '@/types';

export default function CartDrawer(): JSX.Element | null {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const total: number = getTotal();
  const freeShipping: boolean = total >= 999;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-yellow-600" />
            <h2 className="font-display font-semibold text-lg">Your Cart ({items.length})</h2>
          </div>
          <button onClick={closeCart} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {!freeShipping && total > 0 && (
          <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
            <p className="text-xs text-yellow-800">
              Add <span className="font-semibold">₹{(999 - total).toFixed(0)}</span> more for free shipping! 🚚
            </p>
            <div className="mt-1.5 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${Math.min((total / 999) * 100, 100)}%` }} />
            </div>
          </div>
        )}
        {freeShipping && total > 0 && (
          <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700 font-medium text-center">
            🎉 You've unlocked free shipping!
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add some beautiful jewelry!</p>
              <button onClick={closeCart} className="mt-6 btn-gold px-6 py-2.5 rounded-full text-sm font-medium">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item: CartItem) => (
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
                  <p className="text-yellow-600 font-semibold mt-1">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1 hover:text-red-500 text-gray-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-5 py-5 space-y-4 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className={freeShipping ? 'text-green-600 font-medium' : 'text-gray-700'}>
                {freeShipping ? 'FREE' : '₹99'}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-yellow-700">₹{(total + (freeShipping ? 0 : 99)).toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block btn-gold text-center py-3.5 rounded-xl font-semibold text-base">
              Proceed to Checkout →
            </Link>
            <button onClick={closeCart} className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
