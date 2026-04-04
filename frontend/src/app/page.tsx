'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Zap } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi } from '@/lib/api';

const CATEGORIES = [
  { name: 'Rings',       slug: 'rings',       emoji: '💍', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
  { name: 'Necklaces',   slug: 'necklaces',   emoji: '📿', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
  { name: 'Earrings',    slug: 'earrings',    emoji: '✨', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  { name: 'Bracelets',   slug: 'bracelets',   emoji: '⚡', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { name: 'Mangalsutra', slug: 'mangalsutra', emoji: '🌟', img: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&q=80' },
  { name: 'Sets',        slug: 'sets',        emoji: '💛', img: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=400&q=80' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Mumbai', rating: 5, text: 'Quality is insane for the price. My gold ring still looks perfect after 6 months of daily wear.', product: 'Diamond Solitaire Ring' },
  { name: 'Ananya R.', city: 'Delhi', rating: 5, text: 'Obsessed with my pearl earrings!! Got so many compliments at the wedding 😍', product: 'Pearl Drop Earrings' },
  { name: 'Sneha K.', city: 'Bangalore', rating: 5, text: 'Fast shipping, beautiful packaging, love the brand energy. Will definitely order again!', product: 'Tennis Bracelet' },
  { name: 'Riya P.', city: 'Pune', rating: 5, text: 'The mangalsutra is stunning and so delicate. My husband loved it too lol', product: 'Diamond Mangalsutra' },
];

const TRUST_ITEMS = [
  '✦ BIS Hallmarked',
  '✦ Free Shipping ₹999+',
  '✦ 30-Day Returns',
  '✦ Tarnish Resistant',
  '✦ 10,000+ Happy Customers',
  '✦ COD Available',
  '✦ BIS Hallmarked',
  '✦ Free Shipping ₹999+',
  '✦ 30-Day Returns',
  '✦ Tarnish Resistant',
  '✦ 10,000+ Happy Customers',
  '✦ COD Available',
];

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ sort: 'popular', limit: 8 } as any),
      productsApi.getAll({ sort: 'newest',  limit: 4 } as any),
    ]).then(([pop, neu]) => {
      setBestsellers(pop.data.data || []);
      setNewArrivals(neu.data.data  || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-12 lg:py-0 min-h-[88vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-10 items-center w-full py-16">

            {/* Left — text */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-[#FFE8E8] text-[#FF4D4D] text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                <Zap size={12} fill="currentColor" /> New Drop Every Friday
              </div>
              <h1 className="font-sans font-extrabold text-jet leading-[0.92] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
                Fine Jewelry<br />
                <span className="text-[#FF4D4D]">for Real</span><br />
                Life.
              </h1>
              <p className="text-[#666] text-lg font-light leading-relaxed mb-8 max-w-md">
                Gold-plated. Tarnish-resistant. Made for stacking, layering, and wearing every single day.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/shop" className="btn-coral px-8 py-4 text-sm">
                  Shop the Collection →
                </Link>
                <Link href="/shop?sort=newest" className="btn-outline px-8 py-4 text-sm">
                  New Arrivals
                </Link>
              </div>
              {/* Social proof bar */}
              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-2">
                  {['#FFB8C8', '#B8D4FF', '#B8FFD4', '#FFE8B8'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#FFB800" className="text-[#FFB800]" />)}
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">10,000+ happy customers</p>
                </div>
              </div>
            </div>

            {/* Right — hero image collage */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg ml-auto">
                {/* Main image */}
                <div className="absolute inset-4 rounded-3xl overflow-hidden bg-[#F5F5F5]">
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=85"
                    alt="Featured jewelry"
                    className="w-full h-full object-cover" />
                </div>
                {/* Floating card — top left */}
                <div className="absolute -left-4 top-12 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE8E8] flex items-center justify-center text-lg">💍</div>
                  <div>
                    <p className="text-xs font-bold text-jet">New Drop</p>
                    <p className="text-[10px] text-[#999]">Just arrived</p>
                  </div>
                </div>
                {/* Floating card — bottom right */}
                <div className="absolute -right-4 bottom-16 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3CC] flex items-center justify-center text-lg">⭐</div>
                  <div>
                    <p className="text-xs font-bold text-jet">4.9 / 5.0</p>
                    <p className="text-[10px] text-[#999]">2,400+ reviews</p>
                  </div>
                </div>
                {/* Big discount pill */}
                <div className="absolute right-0 top-4 bg-[#FF4D4D] text-white rounded-full px-4 py-2 z-10">
                  <p className="text-sm font-bold">Up to 40% off</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST MARQUEE ─────────────────────────────────── */}
      <div className="bg-jet text-white py-3 overflow-hidden border-y border-[#222]">
        <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
          {TRUST_ITEMS.map((t, i) => (
            <span key={i} className="text-[11px] font-semibold tracking-[0.18em] uppercase flex-shrink-0">{t}</span>
          ))}
        </div>
      </div>

      {/* ── CATEGORY SCROLL ───────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FF4D4D] mb-1.5">Browse</p>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-jet tracking-tight">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-jet hover:text-[#FF4D4D] transition-colors hidden sm:flex items-center gap-1">
            All Jewelry <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
              className="flex-shrink-0 group">
              <div className="w-[130px] sm:w-full aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5] relative mb-2.5">
                <img src={cat.img} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: 'brightness(0.85)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">{cat.emoji}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-jet text-center group-hover:text-[#FF4D4D] transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── JUST DROPPED ──────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="bg-[#F5F5F5] py-16">
          <div className="max-w-screen-xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF4D4D] text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-[0.1em] uppercase flex items-center gap-1.5">
                  <Zap size={11} fill="currentColor" /> Just Dropped
                </div>
                <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-jet tracking-tight">New In</h2>
              </div>
              <Link href="/shop?sort=newest" className="text-sm font-semibold text-jet hover:text-[#FF4D4D] transition-colors hidden sm:flex items-center gap-1">
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── BESTSELLERS ───────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FF4D4D] mb-1.5">Most Loved</p>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-jet tracking-tight">Bestsellers</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-jet hover:text-[#FF4D4D] transition-colors hidden sm:flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-square rounded-2xl" />
                <div className="mt-3 space-y-2">
                  <div className="skeleton h-3 rounded-full w-2/3" />
                  <div className="skeleton h-3 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── EDITORIAL SPLIT ───────────────────────────────── */}
      <section className="bg-jet text-white py-20">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-[#222]">
            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80"
              alt="Bridal jewelry"
              className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FF4D4D] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              ✦ Limited Collection
            </div>
            <h2 className="font-sans font-extrabold text-white leading-tight tracking-tight mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              The Bridal<br />Edit 2025
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Curated sets for your most special day. Free engraving on all bridal orders. Because your story deserves to be told in gold.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/shop?tags=bridal" className="btn-coral px-7 py-3.5 text-sm">
                Shop Bridal →
              </Link>
              <Link href="/shop" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors border border-white/20 hover:border-white rounded-full px-7 py-3.5">
                All Jewelry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FF4D4D] mb-2">Reviews</p>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-jet tracking-tight">
            10,000+ Happy Customers ⭐
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map(r => (
            <div key={r.name} className="bg-[#F5F5F5] rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-3">
                {Array(r.rating).fill(0).map((_, i) => (
                  <Star key={i} size={13} fill="#FFB800" className="text-[#FFB800]" />
                ))}
              </div>
              <p className="text-sm text-[#444] leading-relaxed mb-4">"{r.text}"</p>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-sm font-bold text-jet">{r.name}</p>
                <p className="text-[11px] text-[#999] mt-0.5">{r.city} · {r.product}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────── */}
      <section className="mx-5 sm:mx-8 mb-16 bg-[#FFE8E8] rounded-3xl py-16 px-8 text-center max-w-screen-xl lg:mx-auto">
        <div className="text-4xl mb-4">💌</div>
        <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-jet tracking-tight mb-3">
          Get Early Access
        </h2>
        <p className="text-[#666] text-base mb-8 max-w-sm mx-auto">
          New drops, exclusive deals, and style inspo — straight to your inbox every Friday.
        </p>
        <form className="flex max-w-sm mx-auto gap-2" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="your@email.com"
            className="flex-1 border-2 border-transparent bg-white rounded-full px-5 py-3 text-sm text-jet placeholder-[#aaa] focus:border-[#FF4D4D] outline-none font-medium" />
          <button type="submit" className="btn-coral px-6 py-3 text-sm flex-shrink-0">
            Join →
          </button>
        </form>
        <p className="text-[11px] text-[#999] mt-4">No spam. Unsubscribe anytime.</p>
      </section>
    </div>
  );
}
