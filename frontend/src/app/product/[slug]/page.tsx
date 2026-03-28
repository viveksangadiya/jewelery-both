'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart, Share2, Star, Plus, Minus,
  Shield, Truck, RefreshCw, ChevronLeft, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { productsApi, cartApi } from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import ProductCard from '@/components/product/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';
import toast from 'react-hot-toast';

function getMaterialColor(mat: string): string {
  const m = (mat || '').toLowerCase();
  if (m.includes('rose'))   return '#c8937a';
  if (m.includes('white gold') || m.includes('platinum')) return '#d8d8d8';
  if (m.includes('silver')) return '#b8b8b8';
  if (m.includes('22k'))    return '#c9a84c';
  if (m.includes('18k'))    return '#d4a843';
  if (m.includes('14k'))    return '#e0bc6a';
  if (m.includes('gold') || m.includes('diamond')) return '#d4a843';
  return '#c8bdb0';
}

function Accordion({ label, children, defaultOpen = false }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#E8E0D4]">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#3D2E1E] group-hover:text-[#B8892A] transition-colors">
          {label}
        </span>
        <span className={`text-[#B8892A] text-lg leading-none transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-5 text-sm text-[#6B5344] leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 bg-[#0D0A07]/96 z-[200] flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={22} /></button>
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); onChange(idx - 1); }}
          className="absolute left-6 text-white/30 hover:text-white p-2"><ChevronLeft size={26} /></button>
      )}
      <img src={images[idx]?.image_url || images[idx]} alt=""
        className="max-h-[88vh] max-w-[85vw] object-contain" onClick={e => e.stopPropagation()} />
      {idx < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onChange(idx + 1); }}
          className="absolute right-6 text-white/30 hover:text-white p-2"><ChevronRight size={26} /></button>
      )}
      <div className="absolute bottom-6 flex items-center gap-2">
        {images.map((_: any, i: number) => (
          <button key={i} onClick={e => { e.stopPropagation(); onChange(i); }}
            className={`transition-all duration-300 rounded-full ${i === idx ? 'w-5 h-1.5 bg-[#B8892A]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
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

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-screen-xl mx-auto px-6 py-10 lg:grid lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="skeleton aspect-square" />
          <div className="flex gap-2">{[1,2,3,4].map(i=><div key={i} className="skeleton w-16 h-16 flex-shrink-0"/>)}</div>
        </div>
        <div className="space-y-4 pt-4">
          {[60,35,45,80,100].map((w,i)=><div key={i} className={`skeleton h-${i===4?12:4} rounded`} style={{width:`${w}%`}}/>)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
      <p className="text-[#9A8070] text-sm tracking-widest uppercase">Product not found</p>
    </div>
  );

  const images = product.images?.length
    ? product.images
    : [{ image_url: product.primary_image, alt_text: product.name }];

  const basePrice    = parseFloat(String(product.sale_price || product.base_price));
  const sizeModifier = selectedSize ? parseFloat(String(selectedSize.price_modifier || 0)) : 0;
  const finalPrice   = basePrice + sizeModifier;
  const origPrice    = parseFloat(String(product.base_price));
  const discount     = product.sale_price ? Math.round((1 - product.sale_price / product.base_price) * 100) : 0;
  const wishlisted   = isWishlisted(product.id);

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
    <div className="min-h-screen bg-[#FAF8F4]">
      {lightbox && <Lightbox images={images} idx={activeImg} onClose={() => setLightbox(false)} onChange={setActiveImg} />}

      {/* ── Main layout ───────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-16 items-start">

          {/* LEFT: Images */}
          <div className="lg:sticky lg:top-6 space-y-3">
            {/* Main image */}
            <div className="relative bg-[#EDE8E0] overflow-hidden cursor-zoom-in group aspect-square"
              onClick={() => setLightbox(true)}>
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="bg-[#1A1410] text-[#FAF8F4] text-[9px] font-semibold px-2.5 py-1 tracking-[0.2em] uppercase">
                    −{discount}%
                  </span>
                )}
                {product.is_featured && !discount && (
                  <span className="bg-[#B8892A] text-white text-[9px] font-semibold px-2.5 py-1 tracking-[0.2em] uppercase">
                    New
                  </span>
                )}
              </div>
              <img
                src={images[activeImg]?.image_url || images[activeImg]}
                alt={images[activeImg]?.alt_text || product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Zoom overlay */}
              <div className="absolute inset-0 bg-[#1A1410]/0 group-hover:bg-[#1A1410]/5 transition-colors duration-300" />
              <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={15} className="text-[#3D2E1E]" />
              </div>
              {/* Image nav arrows */}
              {images.length > 1 && activeImg > 0 && (
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => i - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#3D2E1E] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <ChevronLeft size={17} />
                </button>
              )}
              {images.length > 1 && activeImg < images.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => i + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#3D2E1E] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <ChevronRight size={17} />
                </button>
              )}
              {/* Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm px-2.5 py-1">
                  <span className="text-[9px] font-mono text-[#6B5344] tracking-widest">
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
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden transition-all duration-200 ${
                      i === activeImg ? 'ring-2 ring-[#B8892A] ring-offset-1' : 'opacity-50 hover:opacity-80'
                    }`}>
                    <img src={img.image_url || img} alt="" className="w-full h-full object-cover bg-[#EDE8E0]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="mt-8 lg:mt-0">
            {/* Breadcrumb */}
            {product.category_name && (
              <div className="flex items-center gap-2 mb-5">
                <a href="/shop" className="text-[9px] tracking-[0.25em] uppercase text-[#9A8070] hover:text-[#B8892A] transition-colors">Shop</a>
                <span className="text-[#C8B8A8]">·</span>
                <a href={`/shop?category=${product.category_slug}`}
                  className="text-[9px] tracking-[0.25em] uppercase text-[#9A8070] hover:text-[#B8892A] transition-colors">
                  {product.category_name}
                </a>
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl xl:text-4xl text-[#1A1410] leading-tight font-normal mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avg_rating > 0 && (
              <button onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-5 group">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12}
                      className={s <= Math.round(product.avg_rating) ? 'text-[#B8892A]' : 'text-[#D8C8B8]'}
                      fill={s <= Math.round(product.avg_rating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="text-xs text-[#9A8070] group-hover:text-[#6B5344] transition-colors">
                  {product.avg_rating} · {product.review_count} review{product.review_count !== 1 ? 's' : ''}
                </span>
              </button>
            )}

            {/* Gold rule */}
            <div className="h-px bg-gradient-to-r from-[#B8892A]/40 via-[#B8892A]/20 to-transparent mb-6" />

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-3xl text-[#1A1410] font-normal">₹{finalPrice.toLocaleString()}</span>
              {discount > 0 && <>
                <span className="text-base text-[#9A8070] line-through">₹{origPrice.toLocaleString()}</span>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 tracking-wide">SAVE {discount}%</span>
              </>}
            </div>

            {/* Short desc */}
            {product.short_description && (
              <p className="text-sm text-[#6B5344] leading-relaxed mb-6 font-light">{product.short_description}</p>
            )}

            {/* Stock dot */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stock === 0 ? 'bg-red-400' : product.stock <= 5 ? 'bg-orange-400' : 'bg-emerald-400'}`} />
              <p className={`text-xs font-medium ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-emerald-600'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock · Ships in 3–5 days'}
              </p>
            </div>

            {/* Material */}
            {product.material && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#9A8070] mb-2.5">Material</p>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full ring-2 ring-offset-2 ring-[#B8892A]"
                    style={{ backgroundColor: getMaterialColor(product.material) }} />
                  <span className="text-sm text-[#3D2E1E] font-light">{product.material}</span>
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#9A8070]">Size</p>
                  <a href="/size-guide" className="text-[9px] tracking-[0.15em] uppercase text-[#B8892A] hover:text-[#96711E] transition-colors underline underline-offset-2">Size Guide</a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: any) => (
                    <button key={sz.id} onClick={() => setSelectedSize(sz)} disabled={sz.stock === 0}
                      className={`min-w-[44px] h-10 px-3 text-xs font-medium border transition-all duration-200 ${
                        selectedSize?.id === sz.id ? 'bg-[#1A1410] border-[#1A1410] text-white' :
                        sz.stock === 0 ? 'border-[#E8E0D4] text-[#C8B8A8] cursor-not-allowed line-through' :
                        'border-[#D8C8B8] text-[#3D2E1E] hover:border-[#1A1410] bg-white'
                      }`}>
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Engraving */}
            {product.allow_custom_text && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#9A8070] mb-2.5">
                  {product.custom_text_label || 'Engraving'}
                  <span className="ml-2 normal-case tracking-normal text-[#C8B8A8]">· optional</span>
                </p>
                <input type="text" value={customText}
                  onChange={e => setCustomText(e.target.value.slice(0, product.custom_text_max_length || 50))}
                  placeholder="e.g. Always & Forever"
                  className="w-full border border-[#D8C8B8] focus:border-[#B8892A] bg-white px-4 py-3 text-sm text-[#1A1410] placeholder-[#C8B8A8] outline-none transition-colors font-light"
                />
                <p className="text-[9px] text-[#C8B8A8] mt-1 text-right font-mono">{customText.length}/{product.custom_text_max_length || 50}</p>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-5 mb-6">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#9A8070]">Qty</p>
              <div className="flex items-center border border-[#D8C8B8] bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#9A8070] hover:text-[#1A1410] transition-colors"><Minus size={12} /></button>
                <span className="w-10 text-center text-sm font-medium text-[#1A1410]">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#9A8070] hover:text-[#1A1410] transition-colors"><Plus size={12} /></button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2 mb-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}
                className="flex-1 h-14 bg-[#1A1410] hover:bg-[#2D2018] disabled:bg-[#C8B8A8] disabled:cursor-not-allowed text-[#FAF8F4] text-[10px] font-semibold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-all">
                {addingToCart && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button onClick={() => { toggle(product.id); toast.success(wishlisted ? 'Removed' : 'Saved!'); }}
                className={`w-14 h-14 border flex items-center justify-center transition-all ${wishlisted ? 'bg-[#1A1410] border-[#1A1410] text-white' : 'border-[#D8C8B8] text-[#9A8070] hover:border-[#1A1410] hover:text-[#1A1410] bg-white'}`}>
                <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                className="w-14 h-14 border border-[#D8C8B8] bg-white flex items-center justify-center text-[#9A8070] hover:border-[#1A1410] hover:text-[#1A1410] transition-all">
                <Share2 size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 border border-[#E8E0D4] mb-8">
              {[
                { icon: Shield,    label: 'BIS Hallmarked', sub: 'Certified gold' },
                { icon: Truck,     label: 'Free Shipping',  sub: 'Orders ₹999+' },
                { icon: RefreshCw, label: '30-Day Returns', sub: 'Hassle free' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={label} className={`flex flex-col items-center text-center py-4 px-2 gap-1.5 ${i < 2 ? 'border-r border-[#E8E0D4]' : ''}`}>
                  <Icon size={15} strokeWidth={1.5} className="text-[#B8892A]" />
                  <p className="text-[9px] font-semibold tracking-[0.1em] uppercase text-[#3D2E1E]">{label}</p>
                  <p className="text-[9px] text-[#9A8070]">{sub}</p>
                </div>
              ))}
            </div>

            {/* Gold rule */}
            <div className="h-px bg-gradient-to-r from-[#B8892A]/30 via-[#B8892A]/15 to-transparent mb-4" />

            {/* Accordions */}
            <Accordion label="Description" defaultOpen>
              <p>{product.description || product.short_description || 'No description available.'}</p>
            </Accordion>
            <Accordion label="Materials & Craftsmanship">
              {product.material && <p><span className="text-[#3D2E1E] font-medium">Material:</span> {product.material}</p>}
              {product.weight_grams && <p><span className="text-[#3D2E1E] font-medium">Weight:</span> {product.weight_grams}g</p>}
              {product.sku && <p><span className="text-[#3D2E1E] font-medium">SKU:</span> <span className="font-mono text-xs">{product.sku}</span></p>}
              <p className="text-xs pt-1 text-[#9A8070]">BIS hallmarked · responsibly sourced materials.</p>
            </Accordion>
            <Accordion label="Shipping & Returns">
              <p>Free shipping above ₹999. Delivered in 3–5 business days.</p>
              <p>Easy 30-day returns in original packaging with certificate.</p>
            </Accordion>
            <Accordion label="Jewelry Care">
              <p>Store in the provided pouch away from sunlight and moisture.</p>
              <p>Wipe with a soft lint-free cloth. Avoid perfume, lotion, and water.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* ── Below fold ─────────────────────────────────── */}
      <div className="border-t border-[#E8E0D4] bg-[#F5F0E8]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          {similar.length > 0 && (
            <div className="mb-20">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#B8892A] mb-2">You May Also Love</p>
                  <h2 className="font-display text-3xl text-[#1A1410] font-normal">Style With</h2>
                </div>
                <a href={`/shop?category=${product.category_slug || ''}`}
                  className="text-[9px] tracking-[0.2em] uppercase text-[#9A8070] hover:text-[#1A1410] transition-colors border-b border-[#D8C8B8] hover:border-[#1A1410] pb-0.5">
                  View All →
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similar.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
          <div id="reviews-section" className="bg-white border border-[#E8E0D4] p-6 sm:p-10">
            <ReviewsSection productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
