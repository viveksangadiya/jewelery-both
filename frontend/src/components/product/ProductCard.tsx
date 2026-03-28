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
      // 1. Save to server
      await cartApi.add({ product_id: product.id, quantity: 1 });
      // 2. Fetch updated cart and sync store
      const res = await cartApi.get();
      setItems(res.data.data);
      // 3. Open drawer
      openCart();
      toast.success('Added to cart!', { icon: '💍' });
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
    toast.success(was ? 'Removed from wishlist' : 'Saved!', { icon: '❤️' });
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f5f5f3] aspect-[3/4]">
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
              -{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span className="bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className={`absolute top-3 right-3 p-1.5 transition-all ${
            wishlisted ? 'text-gray-900 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'
          }`}>
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* ADD + button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button onClick={handleAddToCart} disabled={adding}
            className="w-full bg-white text-gray-900 text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-gray-900 hover:text-white transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2">
            {adding
              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : 'ADD +'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-900 leading-snug truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-gray-900">₹{price.toLocaleString()}</span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">₹{basePrice.toLocaleString()}</span>
          )}
        </div>
        {product.material && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-4 h-1.5 rounded-sm inline-block" style={{
              backgroundColor:
                product.material.toLowerCase().includes('rose') ? '#c9806a' :
                product.material.toLowerCase().includes('white gold') || product.material.toLowerCase().includes('platinum') || product.material.toLowerCase().includes('silver') ? '#b0b0b0' :
                product.material.toLowerCase().includes('gold') || product.material.toLowerCase().includes('diamond') ? '#c9a84c' :
                '#d1d5db',
            }} />
          </div>
        )}
      </div>
    </Link>
  );
}
