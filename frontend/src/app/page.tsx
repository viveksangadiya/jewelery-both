'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, RefreshCw, Truck, Award, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

// ── Data ──────────────────────────────────────────────────
const heroSlides = [
  {
    eyebrow: 'New Collection · 2025',
    title: 'Crafted\nFor\nForever',
    subtitle: 'Discover our Eternal Diamond Collection — pieces that outlast time itself.',
    cta: 'Explore Collection',
    href: '/shop?category=rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',
    tag: 'Rings',
  },
  {
    eyebrow: 'Bridal Edit · 2025',
    title: 'Your\nPerfect\nMoment',
    subtitle: 'Timeless bridal sets crafted with devotion for the most important day of your life.',
    cta: 'Shop Bridal',
    href: '/shop?tags=bridal',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=90',
    tag: 'Bridal',
  },
  {
    eyebrow: 'Everyday Luxury · 2025',
    title: 'Wear\nYour\nStory',
    subtitle: 'Minimalist everyday pieces that speak volumes without saying a word.',
    cta: 'Shop Now',
    href: '/shop?category=necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',
    tag: 'Necklaces',
  },
];

const CATEGORIES = [
  { name: 'Rings', slug: 'rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
  { name: 'Necklaces', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
  { name: 'Earrings', slug: 'earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' },
  { name: 'Bracelets', slug: 'bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  { name: 'Mangalsutra', slug: 'mangalsutra', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80' },
  { name: 'Sets', slug: 'sets', image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=600&q=80' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Mumbai', rating: 5, text: 'Absolutely in love with my diamond ring. The quality is exceptional and it arrived beautifully packaged.', product: 'Gold Diamond Solitaire Ring' },
  { name: 'Meera R.', city: 'Delhi', rating: 5, text: 'Bought the pearl earrings as a gift for my mother. She was overjoyed! Will definitely shop again.', product: 'Pearl Drop Earrings' },
  { name: 'Anjali K.', city: 'Bangalore', rating: 5, text: 'The tennis bracelet is stunning! Got so many compliments at the wedding. Great value for money.', product: 'Diamond Tennis Bracelet' },
  { name: 'Sneha P.', city: 'Pune', rating: 5, text: 'The mangalsutra is so delicate and beautiful. Exactly what I was looking for. Fast delivery too!', product: 'Modern Diamond Mangalsutra' },
];

const TRUST = [
  { icon: Shield, title: 'Certified Authentic', desc: 'All jewelry BIS hallmarked' },
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: RefreshCw, title: '30-Day Returns', desc: 'Hassle-free return policy' },
  { icon: Award, title: 'Award Winning', desc: 'Best jewelry brand 2024' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (i: number) => {
    if (animating || i === slide) return;
    setPrevSlide(slide);
    setAnimating(true);
    setSlide(i);
    setTimeout(() => setAnimating(false), 700);
  };

  const nextSlide = () => goToSlide((slide + 1) % heroSlides.length);
  const prevSlideBtn = () => goToSlide((slide - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    autoSlideRef.current = setInterval(nextSlide, 6000);
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [slide]);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ sort: 'popular', limit: 8 } as any),
      productsApi.getAll({ sort: 'newest', limit: 4 } as any),
    ]).then(([pop, newer]) => {
      setFeaturedProducts(pop.data.data);
      setNewArrivals(newer.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hero = heroSlides[slide];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          HERO — Mejuri style: text left, image right
      ══════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2 h-[88vh] min-h-[560px] max-h-[860px]">

        {/* Left — cream bg, text */}
        <div className="bg-[#f5f0e6] flex flex-col justify-end px-8 sm:px-14 lg:px-20 pb-14 pt-10 relative overflow-hidden">
          {/* Subtle decorative circle */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full border border-[#e8dfc8] pointer-events-none" />

          <div key={slide} className="relative">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-gray-500 mb-6">{hero.eyebrow}</p>

            {/* Title — big, bold, uppercase like Mejuri */}
            <h1 className="font-display text-[#1a1a1a] leading-[0.9] mb-6 uppercase"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {hero.title.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>

            {/* Subtitle — monospace like Mejuri */}
            <p className="text-gray-600 text-sm leading-relaxed mb-10 max-w-xs" style={{ fontFamily: "monospace" }}>
              {hero.subtitle}
            </p>

            {/* CTA — bordered button like Mejuri */}
            <div className="flex items-center gap-5 flex-wrap">
              <Link href={hero.href}
                className="inline-block border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200">
                {hero.cta}
              </Link>
              <Link href="/shop"
                className="text-gray-500 hover:text-gray-900 text-xs tracking-[0.15em] uppercase border-b border-gray-300 hover:border-gray-900 pb-0.5 transition-colors">
                View All
              </Link>
            </div>
          </div>

          {/* Slide dots — bottom left */}
          <div className="absolute bottom-8 left-14 lg:left-20 flex items-center gap-2.5">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`transition-all duration-300 h-px ${i === slide ? "w-8 bg-[#1a1a1a]" : "w-3 bg-gray-300 hover:bg-gray-500"}`} />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="absolute bottom-6 right-8 flex items-center gap-1">
            <button onClick={prevSlideBtn}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextSlide}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right — full bleed image */}
        <div className="relative overflow-hidden hidden lg:block">
          {heroSlides.map((s, i) => (
            <img key={i} src={s.image} alt={s.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} />
          ))}
          {/* Slide tag badge */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-700">{hero.tag}</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#1a1a1a] border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <Icon size={20} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-bold tracking-wide uppercase">{title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORY GRID — editorial asymmetric layout
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Collections</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a1a]">Shop by Category</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5">
              All Categories <ArrowRight size={14} />
            </Link>
          </div>

          {/* Asymmetric grid — 2 tall + 4 small */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* First 2 — tall */}
            {CATEGORIES.slice(0, 2).map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                className="relative overflow-hidden group lg:row-span-2 aspect-[3/4] lg:aspect-auto">
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white font-display text-2xl font-bold">{cat.name}</p>
                  <p className="text-white/60 text-xs mt-1 flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
                    Shop now <ArrowRight size={11} />
                  </p>
                </div>
              </Link>
            ))}

            {/* Last 4 — shorter */}
            {CATEGORIES.slice(2).map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                className="relative overflow-hidden group aspect-square">
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-display text-lg font-bold">{cat.name}</p>
                  <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
                    Shop now <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED / BESTSELLERS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Most Loved</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a1a]">Bestsellers</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-wrap">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="border-r border-b border-gray-100" style={{ width: '25%' }}>
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-2.5 rounded w-3/4" />
                    <div className="skeleton h-2.5 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap">
              {featuredProducts.map(p => (
                <div key={p.id} className="border-r border-b border-gray-100" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop"
              className="inline-flex items-center gap-3 border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-200">
              Browse All Jewelry <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EDITORIAL BANNER — full bleed split
      ══════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2 min-h-[500px]">
        {/* Left — dark */}
        <div className="relative overflow-hidden bg-[#111] flex items-end">
          <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="relative p-10 lg:p-14">
            <p className="text-yellow-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Limited Time</p>
            <h3 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Bridal<br />Collection</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-7 max-w-xs">Specially curated pieces for your most important day. Free engraving on all bridal orders.</p>
            <Link href="/shop?tags=bridal"
              className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-7 py-3.5 font-bold text-sm tracking-wide uppercase transition-colors">
              Explore <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right — cream */}
        <div className="relative overflow-hidden bg-[#f5f0e8] flex items-end">
          <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="relative p-10 lg:p-14">
            <p className="text-yellow-700 text-xs font-bold tracking-[0.3em] uppercase mb-3">This Week Only</p>
            <h3 className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">Earring<br />Festival</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-7 max-w-xs">Buy 2 earrings, get 1 free. Over 120 styles to choose from — studs, hoops, and danglers.</p>
            <Link href="/shop?category=earrings"
              className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-gray-800 text-white px-7 py-3.5 font-bold text-sm tracking-wide uppercase transition-colors">
              Shop Earrings <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEW ARRIVALS — horizontal scroll strip
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Just In</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a1a]">New Arrivals</h2>
            </div>
            <Link href="/shop?sort=newest" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5">
              See All New <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i}><div className="skeleton aspect-[3/4] rounded" /><div className="skeleton h-3 rounded w-2/3 mt-3" /></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap">
              {newArrivals.map(p => (
                <div key={p.id} className="border-r border-b border-gray-200" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS — minimal elegant cards
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-3">Reviews</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-3">What They're Saying</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-yellow-400">{'★★★★★'}</div>
              <span className="text-gray-500 text-sm">4.9 · 2,400+ verified reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((r, i) => (
              <div key={r.name}
                className="border border-gray-100 p-6 hover:border-yellow-300 hover:shadow-md transition-all duration-300 group">
                {/* Stars */}
                <div className="flex text-yellow-400 mb-4">
                  {Array(r.rating).fill(0).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{r.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city} · {r.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEWSLETTER — editorial full bleed
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#1a1a1a] py-24">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">Stay Updated</p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">Join the Lumière Circle</h2>
          <p className="text-white/50 text-base mb-10">Get early access to new collections, exclusive offers, and jewelry care tips.</p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={e => { e.preventDefault(); }}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 px-5 py-4 text-sm outline-none focus:border-yellow-500 transition-colors"
            />
            <button type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 font-bold text-sm tracking-widest uppercase transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <p className="text-white/25 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
