'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
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

  const price      = parseFloat(String(product.sale_price || product.base_price));
  const basePrice  = parseFloat(String(product.base_price));
  const hasDiscount = product.sale_price && Number(product.sale_price) < Number(product.base_price);
  const discount    = hasDiscount
    ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100)
    : 0;

  /* unique color variants */
  const colorVariants = product.variants?.filter(v =>
    v.name?.toLowerCase() === 'color' || v.name?.toLowerCase() === 'colour'
  ) ?? [];
  const colorCount = colorVariants.length;

  /* descriptor line: material or category */
  const descriptor = [product.material, product.category_name]
    .filter(Boolean)
    .join(', ');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add to bag');
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
      toast.success('Added to bag!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to bag');
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

      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[3/4] bg-white">

        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-hover">
            <span className="text-3xl text-brand-muted">🪢</span>
          </div>
        )}

        {/* Wishlist — top right, always visible on mobile, hover on desktop */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center z-10 bg-white/90 hover:bg-white transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={wishlisted ? 'text-brand-text' : 'text-brand-muted'}
            fill={wishlisted ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>

        {/* New badge — top left */}
        {product.is_featured && (
          <span className="absolute top-3 left-3 z-10 text-[9px] font-medium tracking-[0.15em] uppercase px-2 py-0.5 bg-white text-brand-text">
            New
          </span>
        )}

        {/* Add to Bag — slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-10">
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="w-full h-11 text-[11px] font-medium tracking-[0.15em] uppercase flex items-center justify-center gap-2 bg-black text-white hover:bg-[#333] transition-colors disabled:bg-brand-muted"
          >
            {adding
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="pt-3 pb-1 px-0.5">
        {/* Color count */}
        {colorCount > 1 && (
          <p className="text-[11px] text-brand-muted mb-1">{colorCount} Colors</p>
        )}

        {/* Product name */}
        <h3 className="text-sm text-brand-text leading-snug line-clamp-2 mb-0.5">
          {product.name}
        </h3>

        {/* Descriptor */}
        {descriptor && (
          <p className="text-[11px] text-brand-muted leading-snug line-clamp-1 mb-1.5">
            {descriptor}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-text">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs line-through text-brand-muted">
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] text-brand-secondary font-medium">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
