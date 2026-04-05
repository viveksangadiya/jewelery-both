'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Share2, Star, Plus, Minus, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { productsApi, cartApi } from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import ProductCard from '@/components/product/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';
import PincodeChecker from '@/components/product/PincodeChecker';
import toast from 'react-hot-toast';

// ── Accordion ────────────────────────────────────────────
function Accordion({ label, children, defaultOpen = false }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid #EBEBCA' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase transition-colors"
          style={{ color: '#642308' }}>
          {label}
        </span>
        <span className="text-lg leading-none transition-transform duration-300"
          style={{ color: '#B68868', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none' }}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-5 text-sm leading-relaxed space-y-2"
          style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

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
  }, [idx]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(100,35,8,0.95)' }} onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-6 transition-colors"
        style={{ color: 'rgba(250,249,238,0.4)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#FAF9EE')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,249,238,0.4)')}>
        <X size={22} />
      </button>
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); onChange(idx - 1); }}
          className="absolute left-6 p-2 transition-colors"
          style={{ color: 'rgba(250,249,238,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FAF9EE')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,249,238,0.35)')}>
          <ChevronLeft size={26} />
        </button>
      )}
      <img src={images[idx]?.image_url || images[idx]} alt=""
        className="max-h-[88vh] max-w-[85vw] object-contain" onClick={e => e.stopPropagation()} />
      {idx < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onChange(idx + 1); }}
          className="absolute right-6 p-2 transition-colors"
          style={{ color: 'rgba(250,249,238,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FAF9EE')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,249,238,0.35)')}>
          <ChevronRight size={26} />
        </button>
      )}
      <div className="absolute bottom-6 flex items-center gap-2">
        {images.map((_: any, i: number) => (
          <button key={i} onClick={e => { e.stopPropagation(); onChange(i); }}
            className="transition-all duration-300"
            style={{
              width: i === idx ? '20px' : '6px',
              height: '2px',
              backgroundColor: i === idx ? '#B68868' : 'rgba(250,249,238,0.25)',
            }} />
        ))}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const user   = useAuthStore(s => s.user);

  const [product, setProduct]           = useState<any>(null);
  const [similar, setSimilar]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeImg, setActiveImg]       = useState(0);
  const [lightbox, setLightbox]         = useState(false);
  const [quantity, setQuantity]         = useState(1);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [customText, setCustomText]     = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

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
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-screen-xl mx-auto px-6 py-10 lg:grid lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="skeleton aspect-square" />
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9EE' }}>
      <p className="text-sm tracking-widest uppercase" style={{ color: '#B68868' }}>Product not found</p>
    </div>
  );

  const images     = product.images?.length
    ? product.images
    : [{ image_url: product.primary_image, alt_text: product.name }];
  const basePrice  = parseFloat(String(product.sale_price || product.base_price));
  const sizeMod    = selectedSize ? parseFloat(String(selectedSize.price_modifier || 0)) : 0;
  const finalPrice = basePrice + sizeMod;
  const origPrice  = parseFloat(String(product.base_price));
  const discount   = product.sale_price ? Math.round((1 - product.sale_price / product.base_price) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in'); router.push('/account/login'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    setAddingToCart(true);
    try {
      await cartApi.add({ product_id: product.id, size_id: selectedSize?.id, quantity, custom_text: customText || undefined } as any);
      const cartRes = await cartApi.get();
      setItems(cartRes.data.data);
      openCart();
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setAddingToCart(false); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9EE' }}>
      {lightbox && <Lightbox images={images} idx={activeImg} onClose={() => setLightbox(false)} onChange={setActiveImg} />}

      {/* ── Main layout ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-16 items-start">

          {/* LEFT: Gallery ── sticky */}
          <div className="lg:sticky lg:top-6 space-y-3">
            {/* Main image */}
            <div
              className="relative overflow-hidden cursor-zoom-in group aspect-square"
              style={{ backgroundColor: '#EBEBCA' }}
              onClick={() => setLightbox(true)}>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="text-[9px] font-bold px-2.5 py-1 tracking-[0.2em] uppercase"
                    style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
                    −{discount}%
                  </span>
                )}
                {product.is_featured && !discount && (
                  <span className="text-[9px] font-bold px-2.5 py-1 tracking-[0.2em] uppercase"
                    style={{ backgroundColor: '#FAF9EE', color: '#642308' }}>
                    New
                  </span>
                )}
              </div>

              <img
                src={images[activeImg]?.image_url || images[activeImg]}
                alt={images[activeImg]?.alt_text || product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(250,249,238,0.85)' }}>
                <ZoomIn size={14} style={{ color: '#642308' }} />
              </div>

              {/* Prev/next arrows */}
              {images.length > 1 && activeImg > 0 && (
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => i - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'rgba(250,249,238,0.85)', color: '#642308' }}>
                  <ChevronLeft size={16} />
                </button>
              )}
              {images.length > 1 && activeImg < images.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => i + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'rgba(250,249,238,0.85)', color: '#642308' }}>
                  <ChevronRight size={16} />
                </button>
              )}

              {/* Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 px-2.5 py-1"
                  style={{ backgroundColor: 'rgba(250,249,238,0.75)' }}>
                  <span className="text-[9px] font-mono tracking-widest" style={{ color: '#642308' }}>
                    {String(activeImg + 1).padStart(2,'0')}/{String(images.length).padStart(2,'0')}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden transition-all duration-200"
                    style={{
                      outline: i === activeImg ? `2px solid #B68868` : 'none',
                      outlineOffset: '2px',
                      opacity: i === activeImg ? 1 : 0.5,
                    }}
                    onMouseEnter={e => { if (i !== activeImg) (e.currentTarget.style.opacity = '0.75'); }}
                    onMouseLeave={e => { if (i !== activeImg) (e.currentTarget.style.opacity = '0.5'); }}>
                    <img src={img.image_url || img} alt="" className="w-full h-full object-cover"
                      style={{ backgroundColor: '#EBEBCA' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info panel */}
          <div className="mt-8 lg:mt-0">

            {/* Breadcrumb */}
            {product.category_name && (
              <div className="flex items-center gap-2 mb-5">
                <a href="/shop" className="text-[9px] tracking-[0.25em] uppercase transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  Shop
                </a>
                <span style={{ color: '#EBEBCA' }}>·</span>
                <a href={`/shop?category=${product.category_slug}`}
                  className="text-[9px] tracking-[0.25em] uppercase transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  {product.category_name}
                </a>
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl xl:text-4xl leading-tight font-normal mb-4"
              style={{ color: '#642308' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.avg_rating > 0 && (
              <button
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-5 group">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12}
                      style={{ color: s <= Math.round(product.avg_rating) ? '#903E1D' : '#EBEBCA' }}
                      fill={s <= Math.round(product.avg_rating) ? '#903E1D' : 'none'} />
                  ))}
                </div>
                <span className="text-xs transition-colors" style={{ color: '#B68868' }}>
                  {product.avg_rating} · {product.review_count} review{product.review_count !== 1 ? 's' : ''}
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, #B68868, transparent)' }} />

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-3xl font-normal" style={{ color: '#642308' }}>
                ₹{finalPrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base line-through" style={{ color: '#B68868' }}>
                    ₹{origPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 tracking-wide"
                    style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
                    SAVE {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short desc */}
            {product.short_description && (
              <p className="text-sm leading-relaxed mb-6"
                style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                {product.short_description}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 flex-shrink-0" style={{
                backgroundColor: product.stock === 0 ? '#b91c1c' : product.stock <= 5 ? '#d97706' : '#903E1D',
                borderRadius: '50%',
              }} />
              <p className="text-xs font-medium" style={{
                color: product.stock === 0 ? '#b91c1c' : product.stock <= 5 ? '#d97706' : '#642308',
              }}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock · Ships in 3–5 days'}
              </p>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: '#B68868' }}>Size</p>
                  <a href="/size-guide"
                    className="text-[9px] tracking-[0.15em] uppercase underline underline-offset-2 transition-colors"
                    style={{ color: '#B68868' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                    Size Guide
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: any) => (
                    <button key={sz.id} onClick={() => setSelectedSize(sz)} disabled={sz.stock === 0}
                      className="min-w-[44px] h-10 px-3 text-xs font-medium transition-all duration-200"
                      style={{
                        border: `1px solid ${selectedSize?.id === sz.id ? '#642308' : '#EBEBCA'}`,
                        backgroundColor: selectedSize?.id === sz.id ? '#642308' : 'transparent',
                        color: selectedSize?.id === sz.id ? '#FAF9EE' : sz.stock === 0 ? '#EBEBCA' : '#642308',
                        textDecoration: sz.stock === 0 ? 'line-through' : 'none',
                        cursor: sz.stock === 0 ? 'not-allowed' : 'pointer',
                      }}>
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Engraving / Custom text */}
            {product.allow_custom_text && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[0.3em] uppercase mb-2.5" style={{ color: '#B68868' }}>
                  {product.custom_text_label || 'Personalisation'}
                  <span className="ml-2 normal-case tracking-normal" style={{ color: '#EBEBCA' }}>· optional</span>
                </p>
                <input type="text" value={customText}
                  onChange={e => setCustomText(e.target.value.slice(0, product.custom_text_max_length || 50))}
                  placeholder="e.g. With Love, Always"
                  className="w-full px-4 py-3 text-sm outline-none transition-colors"
                  style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: 'white' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                />
                <p className="text-[9px] mt-1 text-right font-mono" style={{ color: '#B68868' }}>
                  {customText.length}/{product.custom_text_max_length || 50}
                </p>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-5 mb-6">
              <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: '#B68868' }}>Qty</p>
              <div className="flex items-center" style={{ border: '1px solid #EBEBCA' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <Minus size={12} />
                </button>
                <span className="w-10 text-center text-sm font-medium" style={{ color: '#642308' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex gap-2 mb-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}
                className="flex-1 h-14 text-[10px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                onMouseEnter={e => { if (product.stock > 0 && !addingToCart) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#642308'); }}>
                {addingToCart
                  ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'rgba(250,249,238,0.4)', borderTopColor: '#FAF9EE' }} />
                  : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { toggle(product.id); toast.success(wishlisted ? 'Removed' : 'Saved!'); }}
                className="w-14 h-14 flex items-center justify-center transition-all"
                style={{
                  border: `1px solid ${wishlisted ? '#642308' : '#EBEBCA'}`,
                  backgroundColor: wishlisted ? '#642308' : 'transparent',
                  color: wishlisted ? '#FAF9EE' : '#B68868',
                }}
                onMouseEnter={e => { if (!wishlisted) { (e.currentTarget.style.borderColor = '#642308'); (e.currentTarget.style.color = '#642308'); } }}
                onMouseLeave={e => { if (!wishlisted) { (e.currentTarget.style.borderColor = '#EBEBCA'); (e.currentTarget.style.color = '#B68868'); } }}>
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                className="w-14 h-14 flex items-center justify-center transition-all"
                style={{ border: '1px solid #EBEBCA', color: '#B68868' }}
                onMouseEnter={e => { (e.currentTarget.style.borderColor = '#642308'); (e.currentTarget.style.color = '#642308'); }}
                onMouseLeave={e => { (e.currentTarget.style.borderColor = '#EBEBCA'); (e.currentTarget.style.color = '#B68868'); }}>
                <Share2 size={15} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 mb-8" style={{ border: '1px solid #EBEBCA' }}>
              {[
                { icon: Shield,    label: 'Handmade',      sub: 'By artisans' },
                { icon: Truck,     label: 'Free Shipping',  sub: 'Orders ₹499+' },
                { icon: RefreshCw, label: '7-Day Returns',  sub: 'Hassle free' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={label}
                  className="flex flex-col items-center text-center py-4 px-2 gap-1.5"
                  style={{ borderRight: i < 2 ? '1px solid #EBEBCA' : 'none' }}>
                  <Icon size={14} strokeWidth={1.5} style={{ color: '#B68868' }} />
                  <p className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: '#642308' }}>{label}</p>
                  <p className="text-[9px]" style={{ color: '#B68868' }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Pincode checker */}
            <div className="mb-6">
              <PincodeChecker />
            </div>

            {/* Divider */}
            <div className="h-px mb-4" style={{ backgroundColor: '#EBEBCA' }} />

            {/* Accordions */}
            <Accordion label="Description" defaultOpen>
              <p>{product.description || product.short_description || 'No description available.'}</p>
            </Accordion>
            <Accordion label="Materials & Craftsmanship">
              {product.material && <p><span style={{ color: '#642308', fontStyle: 'normal', fontWeight: 500 }}>Material:</span> {product.material}</p>}
              {product.weight_grams && <p><span style={{ color: '#642308', fontStyle: 'normal', fontWeight: 500 }}>Weight:</span> {product.weight_grams}g</p>}
              {product.sku && <p><span style={{ color: '#642308', fontStyle: 'normal', fontWeight: 500 }}>SKU:</span> <span className="font-mono text-xs">{product.sku}</span></p>}
              <p>100% handmade · responsibly sourced materials.</p>
            </Accordion>
            <Accordion label="Shipping & Returns">
              <p>Free shipping above ₹499. Delivered in 3–5 business days across India.</p>
              <p>Easy 7-day returns in original packaging.</p>
            </Accordion>
            <Accordion label="Care Instructions">
              <p>Store in the provided pouch away from direct sunlight and moisture.</p>
              <p>Wipe gently with a soft, lint-free cloth. Avoid contact with water and perfume.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* ── Below fold ── */}
      <div style={{ borderTop: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16">

          {/* Similar products */}
          {similar.length > 0 && (
            <div className="mb-20">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: '#B68868' }}>You May Also Love</p>
                  <h2 className="font-display text-3xl font-normal" style={{ color: '#642308' }}>Style With</h2>
                </div>
                <a href={`/shop?category=${product.category_slug || ''}`}
                  className="text-[9px] tracking-[0.2em] uppercase pb-0.5 transition-colors"
                  style={{ color: '#903E1D', borderBottom: '1px solid #B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}>
                  View All →
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similar.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div id="reviews-section" className="p-6 sm:p-10"
            style={{ backgroundColor: '#FAF9EE', border: '1px solid #EBEBCA' }}>
            <ReviewsSection productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
