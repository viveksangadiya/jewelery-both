'use client';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { cartApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }): JSX.Element {
  const router   = useRouter();
  const user     = useAuthStore(s => s.user);
  const openCart = useCartStore(s => s.openCart);
  const setItems = useCartStore(s => s.setItems);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const [adding, setAdding] = useState(false);

  const price     = parseFloat(String(product.sale_price || product.base_price));
  const basePrice = parseFloat(String(product.base_price));
  const discount  = product.sale_price
    ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add to cart');
      router.push('/account/login');
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await cartApi.add({ product_id: product.id, quantity: 1 });
      const res = await cartApi.get();
      setItems(res.data.data);
      openCart();
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const was = wishlisted;
    await toggle(product.id);
    toast.success(was ? 'Removed from wishlist' : 'Saved!');
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group product-card">

      {/* ── Image container ── */}
      <div className="relative overflow-hidden aspect-[3/4]" style={{ backgroundColor: '#f5f5f5' }}>

        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={28} style={{ color: '#9b9b9b' }} />
          </div>
        )}

        {/* ── Badges — top left ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase bg-[#e32c2b] text-white"
            >
              -{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase text-white"
              style={{ backgroundColor: '#347a07' }}
            >
              NEW
            </span>
          )}
        </div>

        {/* ── Wishlist — top right ── */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center z-10 transition-opacity"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            opacity: wishlisted ? 1 : 0.75,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => { if (!wishlisted) e.currentTarget.style.opacity = '0.75'; }}
        >
          <Heart
            size={13}
            style={{ color: wishlisted ? '#e32c2b' : '#6b6b6b' }}
            fill={wishlisted ? '#e32c2b' : 'none'}
            strokeWidth={1.5}
          />
        </button>

        {/* ── Add to cart — slides up on hover ── */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-250 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full h-12 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-60 bg-[#1c1c1c] text-white hover:bg-[#363636]"
          >
            {adding
              ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin border-white border-t-transparent" />
              : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="pt-3 pb-1">
        <h3 className="text-xs font-medium leading-snug truncate text-[#1c1c1c]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-[#1c1c1c]">
            ₹{price.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-xs line-through text-[#9b9b9b]">
              ₹{basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
