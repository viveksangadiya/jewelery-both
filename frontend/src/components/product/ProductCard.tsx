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
    <Link href={`/product/${product.slug}`} className="block group">

      {/* ── Image container ── */}
      <div className="relative overflow-hidden aspect-[3/4]" style={{ backgroundColor: '#EBEBCA' }}>

        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} style={{ color: '#B68868' }} />
          </div>
        )}

        {/* ── Badges — top left ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
              −{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase"
              style={{ backgroundColor: '#FAF9EE', color: '#642308' }}>
              New
            </span>
          )}
        </div>

        {/* ── Wishlist — top right ── */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center transition-all"
          style={{
            backgroundColor: 'rgba(250,249,238,0.9)',
            opacity: wishlisted ? 1 : 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => { if (!wishlisted) e.currentTarget.style.opacity = '0'; }}
        >
          <Heart
            size={14}
            style={{ color: wishlisted ? '#903E1D' : '#642308' }}
            fill={wishlisted ? '#903E1D' : 'none'}
            strokeWidth={1.5}
          />
        </button>

        {/* ── Hover wishlist reveal — using group ── */}
        <style>{`
          .group:hover .wishlist-btn { opacity: 1 !important; }
        `}</style>

        {/* ── Add to cart — slides up on hover ── */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
            onMouseEnter={e => { if (!adding) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
            onMouseLeave={e => { if (!adding) (e.currentTarget.style.backgroundColor = '#642308'); }}
          >
            {adding
              ? <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FAF9EE', borderTopColor: 'transparent' }} />
              : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="pt-3 pb-2 px-0.5">
        {/* Name */}
        <h3
          className="text-[11px] font-semibold tracking-[0.08em] uppercase leading-snug truncate"
          style={{ color: '#642308' }}>
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold" style={{ color: '#642308' }}>
            ₹{price.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-xs line-through" style={{ color: '#B68868' }}>
              ₹{basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
