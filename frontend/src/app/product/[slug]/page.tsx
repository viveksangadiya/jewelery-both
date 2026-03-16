'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart, ShoppingBag, Share2, Star, Plus, Minus,
  Shield, Truck, RefreshCw, Droplets, Recycle, Award
} from 'lucide-react';
import { productsApi, cartApi } from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import ProductCard from '@/components/product/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';
import type { Product, ProductSize } from '@/types';
import toast from 'react-hot-toast';

// ── Accordion ─────────────────────────────────────────────
function Accordion({ label, children, defaultOpen = false }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900">{label}</span>
        <Plus size={14} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
      </button>
      {open && <div className="pb-5 text-sm text-gray-500 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [customText, setCustomText] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const openCart = useCartStore(s => s.openCart);
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    setSelectedSize(null); setSimilar([]);
    productsApi.getBySlug(params.slug as string)
      .then(r => {
        const p = r.data.data;
        setProduct(p);
        if (p.sizes?.length === 1) setSelectedSize(p.sizes[0]);
        productsApi.getSimilar(p.id).then(s => setSimilar(s.data.data)).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <div className="flex h-screen">
      <div className="flex-1 skeleton" />
      <div className="w-[420px] p-10 space-y-4 border-l border-gray-100">
        <div className="skeleton h-6 rounded w-3/4" />
        <div className="skeleton h-5 rounded w-1/3" />
        <div className="skeleton h-12 rounded" />
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-400 text-sm tracking-wide">Product not found</div>;

  const basePrice = parseFloat(String(product.sale_price || product.base_price));
  const sizeModifier = selectedSize ? parseFloat(String(selectedSize.price_modifier)) : 0;
  const finalPrice = basePrice + sizeModifier;
  const origPrice = parseFloat(String(product.base_price));
  const discount = product.sale_price ? Math.round((1 - product.sale_price / product.base_price) * 100) : 0;
  const images = product.images?.length
    ? product.images
    : [{ image_url: product.primary_image, alt_text: product.name }];
  const wishlisted = isWishlisted(product.id);

  // Material color swatch
  const materialColor = (mat: string) => {
    const m = (mat || '').toLowerCase();
    if (m.includes('22k') || m.includes('22kt')) return '#c9a84c';
    if (m.includes('18k') || m.includes('18kt') || m.includes('yellow gold')) return '#d4a843';
    if (m.includes('14k') || m.includes('14kt')) return '#e0b96a';
    if (m.includes('rose')) return '#c8937a';
    if (m.includes('white gold') || m.includes('platinum')) return '#d0d0d0';
    if (m.includes('silver')) return '#b0b0b0';
    if (m.includes('diamond')) return '#e8e8e8';
    return '#d1d5db';
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in'); router.push('/account/login'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    setAddingToCart(true);
    try {
      await cartApi.add({ product_id: product.id, size_id: selectedSize?.id, quantity, custom_text: customText || undefined });
      openCart();
      toast.success('Added to bag!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setAddingToCart(false); }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── MAIN: full-width, no max-w container ────────── */}
      <div className="lg:flex lg:min-h-screen">

        {/* ── LEFT: vertically scrolling images ─────────── */}
        <div className="lg:flex-1">
          {images.map((img, i) => (
            <div key={i} className="bg-[#f5f5f3]">
              <img
                src={img.image_url}
                alt={img.alt_text || product.name}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          ))}
        </div>

        {/* ── RIGHT: sticky info panel ───────────────────── */}
        <div className="lg:w-[420px] xl:w-[460px] border-l border-gray-100 flex-shrink-0">
          <div className="px-8 xl:px-10 py-10">

            {/* Rating top-right + title */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-xl xl:text-2xl font-bold text-gray-900 leading-tight uppercase tracking-wide flex-1">
                {product.name}
              </h1>
              {product.avg_rating > 0 && (
                <button
                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-1.5 flex-shrink-0 mt-0.5 hover:opacity-70 transition-opacity">
                  <span className="text-sm font-semibold text-gray-700">{product.avg_rating}</span>
                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                </button>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-xl font-semibold text-gray-900">₹{finalPrice.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">₹{origPrice.toLocaleString()}</span>
                  <span className="text-xs font-bold text-red-500">-{discount}%</span>
                </>
              )}
            </div>

            {/* Material label + swatches */}
            {product.material && (
              <div className="mb-5">
                <p className="text-sm text-gray-600 mb-2">{product.material}</p>
                <div className="flex items-center gap-2">
                  {/* Primary swatch — active */}
                  <button
                    className="w-6 h-6 ring-1 ring-offset-1 ring-gray-900"
                    style={{ backgroundColor: materialColor(product.material) }}
                  />
                  {/* Ghost swatches for visual (other metals) */}
                  {['#d4a843', '#d0d0d0'].filter(c => c !== materialColor(product.material)).map(c => (
                    <button key={c}
                      className="w-6 h-6 ring-0 opacity-50 hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <p className={`text-sm mb-5 ${product.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
              {product.stock === 0
                ? 'Out of Stock'
                : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : 'In Stock & Available to Ship'}
            </p>

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-2.5">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: any) => (
                    <button key={sz.id} onClick={() => setSelectedSize(sz)} disabled={sz.stock === 0}
                      className={`px-4 py-2 text-xs font-semibold border transition-all ${
                        selectedSize?.id === sz.id
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : sz.stock === 0
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-200 text-gray-700 hover:border-gray-900'
                      }`}>
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom engraving */}
            {product.allow_custom_text && (
              <div className="mb-5">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">
                  {product.custom_text_label || 'Engraving'}
                </p>
                <input type="text" value={customText}
                  onChange={e => setCustomText(e.target.value.slice(0, product.custom_text_max_length || 50))}
                  placeholder="e.g. Forever yours..."
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors placeholder-gray-300"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">Qty</p>
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <Minus size={12} />
                </button>
                <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* ADD TO BAG + Wishlist — exactly like Mejuri */}
            <div className="flex gap-2 mb-8">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}
                className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white text-xs font-bold tracking-[0.25em] uppercase py-4 flex items-center justify-center gap-2.5 transition-colors disabled:cursor-not-allowed">
                {addingToCart
                  ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : null}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                onClick={() => { toggle(product.id); toast.success(wishlisted ? 'Removed' : 'Saved!'); }}
                className={`w-[52px] border flex items-center justify-center transition-colors ${
                  wishlisted ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900'
                }`}>
                <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description — shown directly like Mejuri (no accordion) */}
            {(product.description || product.short_description) && (
              <div className="mb-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description || product.short_description}
                </p>
              </div>
            )}

            {/* Feature bullets — like Mejuri's icons */}
            <div className="space-y-3 mb-7">
              {[
                { icon: Droplets, text: 'Water Resistant & Hypoallergenic' },
                { icon: Award, text: 'BIS Hallmarked & Certified' },
                { icon: Recycle, text: 'Ethically Sourced Materials' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-500">
                  <Icon size={16} className="text-gray-400 flex-shrink-0" strokeWidth={1.5} />
                  {text}
                </div>
              ))}
            </div>

            {/* VIEW MORE DETAILS bordered button */}
            <button
              onClick={() => document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs font-bold tracking-[0.2em] uppercase border border-gray-300 px-5 py-2.5 hover:border-gray-900 hover:text-gray-900 text-gray-500 transition-colors mb-8">
              View More Details
            </button>

            {/* Trust */}
            <div className="border-t border-gray-100 pt-5 space-y-2.5">
              {[
                { icon: Truck, text: 'Free shipping above ₹999' },
                { icon: RefreshCw, text: 'Easy 30-day returns' },
                { icon: Shield, text: 'Secure checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-xs text-gray-400">
                  <Icon size={12} className="flex-shrink-0" strokeWidth={1.5} />
                  {text}
                </div>
              ))}
            </div>

            {/* Share */}
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
              className="mt-5 flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors">
              <Share2 size={13} strokeWidth={1.5} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* ── BELOW: accordions, style with, reviews ────── */}
      <div className="border-t border-gray-100">

        {/* Accordions — left aligned under image col */}
        <div className="lg:flex">
          <div className="lg:flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-12">
            <div className="max-w-lg">
              <Accordion label="Materials" defaultOpen>
                <div className="space-y-2">
                  <p>Material: <span className="text-gray-700 font-medium">{product.material || 'N/A'}</span></p>
                  {product.weight_grams && <p>Weight: <span className="text-gray-700 font-medium">{product.weight_grams}g</span></p>}
                  <p className="mt-3 text-xs leading-relaxed">All pieces are crafted from responsibly sourced materials and are BIS certified authentic.</p>
                </div>
              </Accordion>
              <Accordion label="Specifications">
                <div className="space-y-2">
                  {product.sku && <p>SKU: <span className="text-gray-700 font-mono text-xs">{product.sku}</span></p>}
                  <p>Category: <span className="text-gray-700 font-medium">{product.category_name || 'N/A'}</span></p>
                </div>
              </Accordion>
              <Accordion label="Shipping & Returns">
                <div className="space-y-2">
                  <p>Free standard shipping on orders above ₹999. Delivery in 3–5 business days.</p>
                  <p>Easy 30-day returns in original condition and packaging.</p>
                </div>
              </Accordion>
              <Accordion label="Jewelry Care">
                <div className="space-y-2">
                  <p>Store in a cool, dry place. Clean with a soft cloth.</p>
                  <p>Avoid contact with perfume, chemicals, and water. Remove before exercising or sleeping.</p>
                </div>
              </Accordion>
            </div>
          </div>
          {/* Right spacer — same width as info panel */}
          <div className="hidden lg:block lg:w-[420px] xl:w-[460px] flex-shrink-0 border-l border-gray-100" />
        </div>

        {/* Style With */}
        {similar.length > 0 && (
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-14 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-900">Style With</h2>
              <a href={`/shop?category=${product.category_slug || ''}`}
                className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 hover:text-gray-900 transition-colors">
                VIEW ALL
              </a>
            </div>
            <div className="flex flex-wrap">
              {similar.slice(0, 4).map((p: any) => (
                <div key={p.id} className="border-r border-b border-gray-100" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div id="reviews-section" className="px-6 sm:px-10 lg:px-16 xl:px-20 py-14 border-t border-gray-100">
          <ReviewsSection productId={product.id} productName={product.name} />
        </div>

      </div>
    </div>
  );
}
