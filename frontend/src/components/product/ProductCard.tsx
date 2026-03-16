'use client';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps): JSX.Element {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted: boolean = isWishlisted(product.id);

  const price: number = parseFloat(String(product.sale_price || product.base_price));
  const basePrice: number = parseFloat(String(product.base_price));
  const discount: number = product.sale_price
    ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    addItem(product);
    openCart();
    toast.success('Added to cart!', { icon: '💍' });
  };

  const handleWishlist = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    const was = wishlisted;
    await toggle(product.id);
    toast.success(was ? 'Removed from wishlist' : 'Saved to wishlist!', { icon: '❤️' });
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group">

      {/* ── Image area — Mejuri style: light bg, no border-radius, full bleed ── */}
      <div className="relative overflow-hidden bg-[#f5f5f3] aspect-[3/4]">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges — top left, minimal text labels like Mejuri */}
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

        {/* Wishlist — top right, minimal */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-1.5 transition-all ${
            wishlisted ? 'text-gray-900' : 'text-gray-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* ADD + button — slides up from bottom on hover, exactly like Mejuri */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-gray-900 text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            ADD +
          </button>
        </div>
      </div>

      {/* ── Info area — Mejuri style: uppercase name, price below, color swatches ── */}
      <div className="pt-3 pb-1">
        {/* Product name — uppercase, tight tracking, small */}
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-900 leading-snug truncate">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5">
          {discount > 0 ? (
            <>
              <span className="text-sm text-gray-900">₹{price.toLocaleString()}</span>
              <span className="text-sm text-gray-400 line-through">₹{basePrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-sm text-gray-900">₹{price.toLocaleString()}</span>
          )}
        </div>

        {/* Material swatch strip — like Mejuri's color dots */}
        {product.material && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="w-4 h-1.5 rounded-sm inline-block"
              style={{
                backgroundColor:
                  product.material.toLowerCase().includes('gold') ? '#c9a84c' :
                  product.material.toLowerCase().includes('silver') ? '#b0b0b0' :
                  product.material.toLowerCase().includes('rose') ? '#c9806a' :
                  product.material.toLowerCase().includes('platinum') ? '#9ca3af' :
                  product.material.toLowerCase().includes('diamond') ? '#e5e7eb' :
                  '#d1d5db',
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
