'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { cartApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

function swatchColor(mat: string): string {
  const m = (mat || '').toLowerCase();
  if (m.includes('rose'))   return '#c8806a';
  if (m.includes('white gold') || m.includes('platinum') || m.includes('silver')) return '#c0c0c0';
  if (m.includes('gold') || m.includes('diamond')) return '#FFB800';
  return '#999';
}

export default function ProductCard({ product }: { product: Product }) {
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
    ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100) : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in'); router.push('/account/login'); return; }
    if (adding) return;
    setAdding(true);
    try {
      await cartApi.add({ product_id: product.id, quantity: 1 });
      const res = await cartApi.get();
      setItems(res.data.data);
      openCart();
      toast.success('Added to bag!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setAdding(false); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const was = wishlisted;
    await toggle(product.id);
    toast.success(was ? 'Removed from wishlist' : 'Saved!');
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5F5F5] aspect-square">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ccc] text-4xl">✦</div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge-sale text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span className="badge-new text-[10px] font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all ${
            wishlisted ? 'text-[#FF4D4D] opacity-100' : 'text-[#999] opacity-0 group-hover:opacity-100'
          }`}>
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Quick add — slides up */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button onClick={handleAdd} disabled={adding}
            className="w-full bg-jet hover:bg-[#333] text-white text-[11px] font-bold tracking-[0.12em] uppercase py-3.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {adding
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : null}
            {adding ? 'Adding...' : 'Quick Add +'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        {product.category_name && (
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#999] mb-1">
            {product.category_name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-jet leading-snug truncate mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-jet">₹{price.toLocaleString()}</span>
          {discount > 0 && (
            <span className="text-xs text-[#999] line-through">₹{basePrice.toLocaleString()}</span>
          )}
          {discount >= 20 && (
            <span className="text-[10px] font-bold text-[#FF4D4D]">{discount}% off</span>
          )}
        </div>
        {/* Material swatch */}
        {product.material && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-3 h-3 rounded-full border border-[#E8E8E8] inline-block"
              style={{ background: swatchColor(product.material) }} />
          </div>
        )}
      </div>
    </Link>
  );
}
