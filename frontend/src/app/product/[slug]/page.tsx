'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart, Share2, Star, Plus, Minus, Shield, Truck, RefreshCw,
  ChevronLeft, ChevronRight, X, ZoomIn, Minus as MinusIcon,
} from 'lucide-react';
import { productsApi, cartApi } from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import ProductCard from '@/components/product/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';
import PincodeChecker from '@/components/product/PincodeChecker';
import toast from 'react-hot-toast';

// ── Lightbox ─────────────────────────────────────────────
function Lightbox({ images, idx, onClose, onChange }: {
  images: any[]; idx: number; onClose: () => void; onChange: (i: number) => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange(Math.min(idx + 1, images.length - 1));
      if (e.key === 'ArrowLeft')  onChange(Math.max(idx - 1, 0));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [idx, images.length, onClose, onChange]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
      >
        <X size={22} />
      </button>
      {idx > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onChange(idx - 1); }}
          className="absolute left-6 p-2 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={26} />
        </button>
      )}
      <img
        src={images[idx]?.image_url || images[idx]}
        alt=""
        className="max-h-[88vh] max-w-[85vw] object-contain"
        onClick={e => e.stopPropagation()}
      />
      {idx < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onChange(idx + 1); }}
          className="absolute right-6 p-2 text-white/40 hover:text-white transition-colors"
        >
          <ChevronRight size={26} />
        </button>
      )}
      <div className="absolute bottom-6 flex items-center gap-2">
        {images.map((_: any, i: number) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); onChange(i); }}
            className="transition-all duration-300"
            style={{
              width: i === idx ? '20px' : '6px',
              height: '2px',
              backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────
function Accordion({ label, children, defaultOpen = false }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-brand-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
          {label}
        </span>
        <span
          className="text-lg leading-none text-brand-muted transition-transform duration-300"
          style={{ display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-5 text-sm leading-relaxed space-y-2 text-brand-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Horizontal product carousel ──────────────────────────
function ProductCarousel({ products, title, subtitle }: {
  products: any[]; title: string; subtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          {subtitle && (
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-1">{subtitle}</p>
          )}
          <h2 className="font-display text-2xl font-normal text-brand-text">{title}</h2>
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
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        {products.map((p: any) => (
          <div key={p.id} className="flex-shrink-0 w-[220px] sm:w-[260px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const params  = useParams();
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);

  const [product, setProduct]           = useState<any>(null);
  const [similar, setSimilar]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeImg, setActiveImg]       = useState(0);
  const [lightbox, setLightbox]         = useState(false);
  const [quantity, setQuantity]         = useState(1);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [customText, setCustomText]     = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [delivery, setDelivery]         = useState<'ship' | 'collect'>('ship');

  const openCart = useCartStore(s => s.openCart);
  const setItems = useCartStore(s => s.setItems);
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    setActiveImg(0); setSelectedSize(null); setSimilar([]);
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

  // ── Loading skeleton ──────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-screen-xl mx-auto px-6 py-10 lg:grid lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="skeleton aspect-[3/4]" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton w-16 h-16 flex-shrink-0" />)}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          {[60,35,45,80,100].map((w,i) => (
            <div key={i} className="skeleton rounded" style={{ height: i === 4 ? '48px' : '14px', width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <p className="text-sm tracking-widest uppercase text-brand-muted">Product not found</p>
    </div>
  );

  const images      = product.images?.length
    ? product.images
    : [{ image_url: product.primary_image, alt_text: product.name }];
  const basePrice   = parseFloat(String(product.sale_price || product.base_price));
  const sizeMod     = selectedSize ? parseFloat(String(selectedSize.price_modifier || 0)) : 0;
  const finalPrice  = basePrice + sizeMod;
  const origPrice   = parseFloat(String(product.base_price));
  const hasDiscount = product.sale_price && Number(product.sale_price) < Number(product.base_price);
  const discount    = hasDiscount
    ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100)
    : 0;
  const wishlisted  = isWishlisted(product.id);

  /* color variants */
  const colorVariants = product.variants?.filter((v: any) =>
    v.name?.toLowerCase() === 'color' || v.name?.toLowerCase() === 'colour'
  ) ?? [];

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in'); router.push('/account/login'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    setAddingToCart(true);
    try {
      await cartApi.add({ product_id: product.id, size_id: selectedSize?.id, quantity, custom_text: customText || undefined } as any);
      const cartRes = await cartApi.get();
      setItems(cartRes.data.data);
      openCart();
      toast.success('Added to bag!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setAddingToCart(false); }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {lightbox && (
        <Lightbox
          images={images}
          idx={activeImg}
          onClose={() => setLightbox(false)}
          onChange={setActiveImg}
        />
      )}

      {/* ── Breadcrumb ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-brand-muted">
          <a href="/" className="hover:text-brand-text transition-colors">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-brand-text transition-colors">Shop</a>
          {product.category_name && (
            <>
              <span>/</span>
              <a href={`/shop?category=${product.category_slug}`} className="hover:text-brand-text transition-colors">
                {product.category_name}
              </a>
            </>
          )}
          <span>/</span>
          <span className="text-brand-text truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-12 xl:gap-16 items-start">

          {/* LEFT: Gallery (sticky) */}
          <div className="lg:sticky lg:top-6">
            <div className="flex gap-3">

              {/* Vertical thumbnail strip */}
              {images.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-[68px] flex-shrink-0">
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="w-full aspect-square overflow-hidden flex-shrink-0 bg-white transition-all duration-200"
                      style={{
                        outline: i === activeImg ? '2px solid #000' : '2px solid transparent',
                        outlineOffset: '1px',
                        opacity: i === activeImg ? 1 : 0.5,
                      }}
                    >
                      <img
                        src={img.image_url || img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="flex-1 relative overflow-hidden cursor-zoom-in group bg-white"
                style={{ aspectRatio: '3/4' }}
                onClick={() => setLightbox(true)}
              >
                {/* New badge */}
                {product.is_featured && !hasDiscount && (
                  <span className="absolute top-4 left-4 z-10 text-[9px] font-medium tracking-[0.15em] uppercase px-2 py-0.5 bg-white text-brand-text">
                    New
                  </span>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <span className="absolute top-4 left-4 z-10 text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-0.5 bg-brand-text text-white">
                    -{discount}%
                  </span>
                )}

                <img
                  src={images[activeImg]?.image_url || images[activeImg]}
                  alt={images[activeImg]?.alt_text || product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center bg-white/85 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={14} className="text-brand-text" />
                </div>

                {/* Prev / next arrows */}
                {images.length > 1 && activeImg > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImg(i => i - 1); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/85 text-brand-text opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {images.length > 1 && activeImg < images.length - 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImg(i => i + 1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/85 text-brand-text opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-white/75">
                    <span className="text-[9px] font-mono tracking-widest text-brand-text">
                      {String(activeImg + 1).padStart(2,'0')}/{String(images.length).padStart(2,'0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile thumbnails */}
            {images.length > 1 && (
              <div className="flex sm:hidden gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 w-14 h-14 overflow-hidden bg-white transition-all duration-200"
                    style={{
                      outline: i === activeImg ? '2px solid #000' : '2px solid transparent',
                      outlineOffset: '1px',
                      opacity: i === activeImg ? 1 : 0.5,
                    }}
                  >
                    <img src={img.image_url || img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info panel */}
          <div className="mt-8 lg:mt-0">

            {/* Collection tag */}
            {product.collection_name && (
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-2">
                {product.collection_name}
              </p>
            )}

            {/* Product name */}
            <h1 className="font-display text-3xl xl:text-4xl leading-tight font-normal text-brand-text mb-3">
              {product.name}
            </h1>

            {/* Article number */}
            {product.sku && (
              <p className="text-[10px] tracking-[0.1em] text-brand-muted mb-4">
                Item No. {product.sku}
              </p>
            )}

            {/* Rating */}
            {product.avg_rating > 0 && (
              <button
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-5 group"
              >
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= Math.round(product.avg_rating) ? 'text-brand-text' : 'text-brand-border'}
                      fill={s <= Math.round(product.avg_rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-muted group-hover:text-brand-text transition-colors">
                  {product.avg_rating} ({product.review_count})
                </span>
              </button>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-medium text-brand-text">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base line-through text-brand-muted">
                    ₹{origPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-brand-secondary font-medium">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm leading-relaxed text-brand-secondary mb-6">
                {product.short_description}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: product.stock === 0 ? '#b91c1c' : product.stock <= 5 ? '#d97706' : '#2d7a2d',
                }}
              />
              <p className="text-xs text-brand-secondary">
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
              </p>
            </div>

            <div className="h-px bg-brand-border mb-6" />

            {/* Color swatches */}
            {colorVariants.length > 1 && (
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted mb-3">
                  Color — <span className="text-brand-text normal-case tracking-normal">{colorVariants[0]?.value || 'Select'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((v: any) => (
                    <button
                      key={v.id}
                      title={v.value}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: v.color_hex || '#ccc',
                        borderColor: '#000',
                        outline: '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted">Size</p>
                  <a
                    href="/size-guide"
                    className="text-[10px] tracking-[0.15em] uppercase underline underline-offset-2 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    Size Guide
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: any) => (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSize(sz)}
                      disabled={sz.stock === 0}
                      className="min-w-[44px] h-10 px-3 text-xs font-medium transition-all duration-200 border"
                      style={{
                        borderColor: selectedSize?.id === sz.id ? '#000' : '#E0D9D0',
                        backgroundColor: selectedSize?.id === sz.id ? '#000' : 'transparent',
                        color: selectedSize?.id === sz.id ? '#fff' : sz.stock === 0 ? '#ccc' : '#000',
                        textDecoration: sz.stock === 0 ? 'line-through' : 'none',
                        cursor: sz.stock === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalisation */}
            {product.allow_custom_text && (
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted mb-2.5">
                  {product.custom_text_label || 'Personalisation'}
                  <span className="ml-2 normal-case tracking-normal text-brand-muted/60">— optional</span>
                </p>
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value.slice(0, product.custom_text_max_length || 50))}
                  placeholder="e.g. With Love, Always"
                  className="w-full px-4 py-3 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors"
                />
                <p className="text-[9px] mt-1 text-right text-brand-muted font-mono">
                  {customText.length}/{product.custom_text_max_length || 50}
                </p>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-5 mb-5">
              <p className="text-[10px] tracking-[0.25em] uppercase text-brand-muted">Qty</p>
              <div className="flex items-center border border-brand-border">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-10 text-center text-sm font-medium text-brand-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Add to Bag + Wishlist */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="btn-brand flex-1 h-12"
              >
                {addingToCart
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : product.stock === 0 ? 'Out of Stock' : 'Add to Bag'
                }
              </button>
              <button
                onClick={() => { toggle(product.id); toast.success(wishlisted ? 'Removed from wishlist' : 'Saved!'); }}
                className="w-12 h-12 flex items-center justify-center border transition-all"
                style={{
                  borderColor: wishlisted ? '#000' : '#E0D9D0',
                  backgroundColor: wishlisted ? '#000' : 'transparent',
                  color: wishlisted ? '#fff' : '#999',
                }}
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                className="w-12 h-12 flex items-center justify-center border border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text transition-all"
              >
                <Share2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Delivery options */}
            <div className="mb-6 border border-brand-border">
              <div className="grid grid-cols-2">
                {[
                  { key: 'ship',    label: 'Deliver to Address' },
                  { key: 'collect', label: 'Click & Collect' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDelivery(key as 'ship' | 'collect')}
                    className="py-3 text-[10px] font-medium tracking-[0.1em] uppercase transition-colors border-r last:border-r-0 border-brand-border"
                    style={{
                      backgroundColor: delivery === key ? '#000' : 'transparent',
                      color: delivery === key ? '#fff' : '#999',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-4 text-xs text-brand-secondary">
                {delivery === 'ship' ? (
                  <div className="space-y-1">
                    <p className="font-medium text-brand-text">Free standard delivery</p>
                    <p>On orders above ₹499 · Delivered in 3–5 business days</p>
                    <div className="mt-2">
                      <PincodeChecker />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-brand-text">Collect in-store</p>
                    <p>Ready within 24–48 hours · No delivery charges</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 border border-brand-border mb-6">
              {[
                { icon: Shield,    label: 'Handcrafted',    sub: 'By artisans' },
                { icon: Truck,     label: 'Free Shipping',  sub: 'Orders ₹499+' },
                { icon: RefreshCw, label: '7-Day Returns',  sub: 'Hassle free' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center py-4 px-2 gap-1.5 border-r border-brand-border last:border-r-0"
                >
                  <Icon size={14} strokeWidth={1.5} className="text-brand-muted" />
                  <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-brand-text">{label}</p>
                  <p className="text-[9px] text-brand-muted">{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <Accordion label="Details" defaultOpen>
              <p>{product.description || product.short_description || 'No description available.'}</p>
              {product.material && (
                <p><span className="font-medium text-brand-text">Material:</span> {product.material}</p>
              )}
              {product.weight_grams && (
                <p><span className="font-medium text-brand-text">Weight:</span> {product.weight_grams}g</p>
              )}
              {product.sku && (
                <p><span className="font-medium text-brand-text">Item No.:</span> <span className="font-mono text-xs">{product.sku}</span></p>
              )}
            </Accordion>
            <Accordion label="Materials & Craftsmanship">
              <p>100% handmade by skilled artisans using responsibly sourced materials.</p>
              {product.material && <p>Primary material: {product.material}</p>}
              <p>Plating: Gold / Silver (as shown)</p>
            </Accordion>
            <Accordion label="Delivery & Returns">
              <p><span className="font-medium text-brand-text">Standard delivery:</span> 3–5 business days.</p>
              <p>Free shipping on all orders above ₹499.</p>
              <p><span className="font-medium text-brand-text">Returns:</span> Easy 7-day returns in original packaging.</p>
            </Accordion>
            <Accordion label="Care Guide">
              <p>Store in the provided pouch away from direct sunlight and moisture.</p>
              <p>Wipe gently with a soft, lint-free cloth. Avoid contact with water and perfume.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* ── Below fold: carousels + reviews ── */}
      <div className="border-t border-brand-border mt-16">

        {/* You May Also Like */}
        {similar.length > 0 && (
          <div className="bg-brand-bg py-16">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
              <ProductCarousel
                products={similar}
                title="You May Also Like"
                subtitle="Complete the Look"
              />
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white py-16">
          <div
            id="reviews-section"
            className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10"
          >
            <ReviewsSection productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
