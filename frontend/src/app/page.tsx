'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, RefreshCw, Truck, Award, ChevronLeft, ChevronRight, Star, Sparkles, Clock, Leaf, Heart, Package } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productsApi } from '@/lib/api';

// ── Data ──────────────────────────────────────────────────

const heroSlides = [
  {
    eyebrow: 'New Collection · 2025',
    title: 'Handcrafted\nWith\nDevotion',
    subtitle: 'Bring the beauty of Indian artisanship to your doorstep. Every toran tells a timeless story.',
    cta: 'Shop Torans',
    href: '/shop?category=door-torans',
    image: 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=900&q=90',
    tag: 'Door Torans',
  },
  {
    eyebrow: 'Festival Edit · 2025',
    title: 'Welcome\nThe\nFestive\nSeason',
    subtitle: 'Celebrate Diwali, Navratri & every auspicious occasion with handmade torans crafted by skilled artisans.',
    cta: 'Festival Collection',
    href: '/shop?category=festival',
    image: 'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=900&q=90',
    tag: 'Festival',
  },
  {
    eyebrow: 'Wedding Special · 2025',
    title: 'Bless\nEvery\nEntrance',
    subtitle: 'Adorn your wedding mandap and home entrance with our exquisite bridal toran collections.',
    cta: 'Wedding Collection',
    href: '/shop?category=wedding',
    image: 'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=900&q=90',
    tag: 'Wedding',
  },
];

const CATEGORIES = [
  { name: 'Door Torans',    slug: 'door-torans',   image: 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=600&q=80',  desc: 'Traditional & modern' },
  { name: 'Festival Decor', slug: 'festival',       image: 'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=600&q=80',  desc: 'Diwali, Navratri & more' },
  { name: 'Wedding',        slug: 'wedding',        image: 'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=600&q=80',  desc: 'Bridal entrance decor' },
  { name: 'Wall Hangings',  slug: 'wall-hangings',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',    desc: 'Boho & macramé art' },
  { name: 'Fabric Torans',  slug: 'door-torans&tag=fabric', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', desc: 'Thread & cloth craft' },
  { name: 'Gift Sets',      slug: 'gift-sets',      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',    desc: 'Curated craft hampers' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',  city: 'Jaipur',    rating: 5, text: 'Absolutely stunning toran! The mirror work is so intricate. Got so many compliments from guests.', product: 'Mirror Work Toran' },
  { name: 'Meera R.',  city: 'Surat',     rating: 5, text: 'Ordered a festival toran for Diwali. Packaging was beautiful, arrived safely, and looks gorgeous on our door.', product: 'Diwali Festival Toran' },
  { name: 'Anjali K.', city: 'Pune',      rating: 5, text: 'The bridal toran for my daughter\'s wedding was perfect. Everyone kept asking where we got it from!', product: 'Bridal Entrance Toran' },
  { name: 'Sneha P.',  city: 'Ahmedabad', rating: 5, text: 'Love the quality of fabric. The colours are vibrant and exactly as shown. Will definitely order again!', product: 'Fabric Tassel Toran' },
];

const TRUST = [
  { icon: Sparkles, title: '100% Handmade',  desc: 'Crafted by skilled artisans' },
  { icon: Truck,    title: 'Free Shipping',   desc: 'On orders above ₹499' },
  { icon: RefreshCw,title: '7-Day Returns',   desc: 'Hassle-free return policy' },
  { icon: Award,    title: 'Made in India',   desc: 'Supporting local artisans' },
];

const STATS = [
  { number: '500+',    label: 'Happy Customers' },
  { number: '50+',     label: 'Pincodes Reached' },
  { number: '1000+',   label: 'Products Delivered' },
];

const BRAND_VALUES = [
  { icon: Clock,  hindi: 'सदाबहार', english: 'TIMELESS' },
  { icon: Heart,  hindi: 'प्रेम',    english: 'CRAFTED WITH LOVE' },
  { icon: Leaf,   hindi: 'प्रामाणिक', english: 'AUTHENTIC' },
];

const CRAFT_FEATURES = [
  { icon: '🏺', label: 'Heritage\nCraft' },
  { icon: '✋', label: 'Skin\nFriendly' },
  { icon: '♾️', label: 'Made\nto Last' },
  { icon: '🌿', label: 'Natural\nMaterials' },
  { icon: '🎁', label: 'Gift\nReady' },
];

const PRODUCT_TABS = ['Best Sellers', 'New Arrivals', 'Festival', 'Wedding'] as const;
type ProductTab = typeof PRODUCT_TABS[number];

const ARTISAN_STEPS = [
  { step: '01', title: 'Artisan Selection', desc: 'We partner with skilled craftspeople from Rajasthan, Gujarat & across India.' },
  { step: '02', title: 'Handcrafted',       desc: 'Every toran is made by hand using traditional techniques passed down generations.' },
  { step: '03', title: 'Quality Check',     desc: 'Each piece goes through careful inspection before it reaches your home.' },
  { step: '04', title: 'Delivered to You',  desc: 'Safely packaged and shipped right to your doorstep with love.' },
];

export default function HomePage() {
  const [slide, setSlide]                   = useState(0);
  const [animating, setAnimating]           = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals]       = useState<any[]>([]);
  const [festivalProducts, setFestivalProducts] = useState<any[]>([]);
  const [weddingProducts, setWeddingProducts]   = useState<any[]>([]);
  const [activeTab, setActiveTab]           = useState<ProductTab>('Best Sellers');
  const [loading, setLoading]               = useState(true);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (i: number) => {
    if (animating || i === slide) return;
    setAnimating(true);
    setSlide(i);
    setTimeout(() => setAnimating(false), 600);
  };
  const nextSlide    = () => goToSlide((slide + 1) % heroSlides.length);
  const prevSlideBtn = () => goToSlide((slide - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    autoSlideRef.current = setInterval(nextSlide, 6000);
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [slide]);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ sort: 'popular',  limit: 8 } as any),
      productsApi.getAll({ sort: 'newest',   limit: 8 } as any),
      productsApi.getAll({ category: 'festival', limit: 8 } as any),
      productsApi.getAll({ category: 'wedding',  limit: 8 } as any),
    ]).then(([pop, newer, fest, wed]) => {
      setFeaturedProducts(pop.data.data);
      setNewArrivals(newer.data.data);
      setFestivalProducts(fest.data.data);
      setWeddingProducts(wed.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tabProducts: Record<ProductTab, any[]> = {
    'Best Sellers': featuredProducts,
    'New Arrivals': newArrivals,
    'Festival':     festivalProducts,
    'Wedding':      weddingProducts,
  };

  const hero = heroSlides[slide];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* ══════════════════════════════════════════════════
          HERO — split: text left, image right
      ══════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2 h-[88vh] min-h-[560px] max-h-[860px]">

        {/* Left — white, text */}
        <div className="flex flex-col justify-end px-8 sm:px-14 lg:px-20 pb-14 pt-10 relative overflow-hidden bg-white">

          <div key={slide} className="relative animate-fade-in">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase mb-6 text-[#9b9b9b]">
              {hero.eyebrow}
            </p>

            {/* Tag badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase mb-5"
              style={{ backgroundColor: '#1c1c1c', color: '#ffffff' }}>
              {hero.tag}
            </div>

            {/* Title */}
            <h1 className="leading-[0.9] mb-6 uppercase font-bold"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)', letterSpacing: '-0.02em', color: '#1c1c1c' }}>
              {hero.title.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-sm leading-relaxed mb-10 max-w-xs text-[#6b6b6b]">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-5 flex-wrap">
              <Link href={hero.href}
                className="inline-block px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 bg-[#1c1c1c] text-white"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#363636'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1c1c1c'; }}>
                {hero.cta}
              </Link>
              <Link href="/shop"
                className="text-xs tracking-[0.15em] uppercase pb-0.5 text-[#1c1c1c] transition-opacity hover:opacity-60"
                style={{ borderBottom: '1px solid #1c1c1c' }}>
                View All
              </Link>
            </div>
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-8 left-14 lg:left-20 flex items-center gap-2.5">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className="transition-all duration-300 h-px"
                style={{ width: i === slide ? '32px' : '12px', backgroundColor: i === slide ? '#1c1c1c' : '#d4d4d4' }} />
            ))}
          </div>

          {/* Prev/Next */}
          <div className="absolute bottom-6 right-8 flex items-center gap-1">
            <button onClick={prevSlideBtn}
              className="w-8 h-8 flex items-center justify-center transition-colors text-[#9b9b9b] hover:text-[#1c1c1c]">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextSlide}
              className="w-8 h-8 flex items-center justify-center transition-colors text-[#9b9b9b] hover:text-[#1c1c1c]">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right — full image */}
        <div className="relative overflow-hidden hidden lg:block">
          {heroSlides.map((s, i) => (
            <img key={i} src={s.image} alt={s.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          {/* Tag badge */}
          <div className="absolute top-6 left-6 px-3 py-1.5 bg-white">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1c1c1c]">{hero.tag}</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR (saadaa-style big numbers)
      ══════════════════════════════════════════════════ */}
      <section className="py-10 bg-white" style={{ borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#e8e8e8' }}>
            {STATS.map(({ number, label }) => (
              <div key={label} className="text-center py-4">
                <p className="text-4xl lg:text-5xl font-bold text-[#1c1c1c]">{number}</p>
                <p className="text-xs mt-2 text-[#9b9b9b] tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CRAFT FEATURES STRIP
      ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between py-6 gap-4 overflow-x-auto">
            {CRAFT_FEATURES.map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[80px]">
                <span className="text-2xl">{icon}</span>
                <p className="text-[10px] font-semibold text-center text-[#1c1c1c] whitespace-pre-line leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORY GRID
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2 text-[#9b9b9b]">Collections</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#1c1c1c]">Shop by Style</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#1c1c1c] pb-0.5 hover:opacity-60 transition-opacity"
              style={{ borderBottom: '1px solid #1c1c1c' }}>
              All Collections <ArrowRight size={14} />
            </Link>
          </div>

          {/* Grid: 2 tall + 4 square */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.slice(0, 2).map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                className="relative overflow-hidden group lg:row-span-2 aspect-[3/4] lg:aspect-auto">
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 60%)' }} />
                <div className="absolute bottom-5 left-5">
                  <p className="text-2xl font-bold text-white">{cat.name}</p>
                  <p className="text-xs mt-1 text-white/60">{cat.desc}</p>
                  <p className="text-xs mt-2 flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                    Shop now <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}

            {CATEGORIES.slice(2).map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                className="relative overflow-hidden group aspect-square">
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.05) 55%)' }} />
                <div className="absolute bottom-4 left-4">
                  <p className="text-lg font-bold text-white">{cat.name}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                    Shop now <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BRAND STORY (saadaa-style)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white text-center" style={{ borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold leading-snug mb-6 text-[#1c1c1c]">
            WELCOME TO THE WORLD<br />
            OF <span className="font-normal" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>हस्तकला</span> | HASTKALA<br />
            <span className="text-2xl font-normal text-[#6b6b6b]">Handcrafted With Devotion.</span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-sm text-[#9b9b9b] mb-12">
            <Link href="/about" className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors">Read The Story</Link>
            <span>and</span>
            <Link href="/shop" className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors">Meet The Artisans</Link>
          </div>
          <div className="flex items-center justify-center gap-12 mb-12">
            {BRAND_VALUES.map(({ icon: Icon, hindi, english }) => (
              <div key={english} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-[#e8e8e8] flex items-center justify-center">
                  <Icon size={20} className="text-[#1c1c1c]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] text-[#9b9b9b]">{hindi}</p>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#1c1c1c]">{english}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#9b9b9b] mb-2">Together, let's celebrate artisan heritage :</p>
          <p className="text-sm font-semibold text-[#1c1c1c] tracking-wide">#HASTKALA #WEARHASTKALA</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TABBED PRODUCTS (saadaa-style tabs)
      ══════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          {/* Tab bar */}
          <div className="flex items-center justify-center gap-1 mb-12">
            {PRODUCT_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-6 py-2.5 text-sm font-medium transition-all duration-200 rounded-full"
                style={{
                  backgroundColor: activeTab === tab ? '#1c1c1c' : 'transparent',
                  color:           activeTab === tab ? '#ffffff' : '#6b6b6b',
                  border:          activeTab === tab ? '1px solid #1c1c1c' : '1px solid #e8e8e8',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-wrap">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="border-r border-b border-[#e8e8e8]" style={{ width: '25%' }}>
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
              {(tabProducts[activeTab] || []).map((p: any) => (
                <div key={p.id} className="border-r border-b border-[#e8e8e8] bg-white" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
              {!loading && (tabProducts[activeTab] || []).length === 0 && (
                <div className="w-full py-20 text-center">
                  <p className="text-sm text-[#9b9b9b]">No products yet in this collection.</p>
                  <Link href="/shop" className="mt-4 inline-block text-sm underline text-[#1c1c1c]">Browse all</Link>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop"
              className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold tracking-widest uppercase transition-colors duration-200 border-2 border-[#1c1c1c] text-[#1c1c1c]"
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#1c1c1c';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#1c1c1c';
              }}>
              Browse All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ARTISAN STORY
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white" style={{ borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-[#9b9b9b]">Our Process</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-[#1c1c1c]">Made with Artisan Care</h2>
            <p className="text-sm max-w-xl mx-auto text-[#6b6b6b]">
              From the hands of our artisans in Rajasthan and Gujarat, directly to your doorstep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ARTISAN_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-5 border border-[#e8e8e8] group-hover:border-[#1c1c1c] transition-colors">
                  <span className="text-lg font-bold text-[#1c1c1c]">{step}</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-[#1c1c1c]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#6b6b6b]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EDITORIAL SPLIT BANNER
      ══════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2 min-h-[500px]">
        {/* Left — dark */}
        <div className="relative overflow-hidden flex items-end bg-[#1c1c1c]">
          <img src="https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=800&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative p-10 lg:p-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-white/50">Limited Collection</p>
            <h3 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
              Diwali<br />Festival<br />Torans
            </h3>
            <p className="text-sm leading-relaxed mb-7 max-w-xs text-white/55">
              Light up your home entrance this Diwali with handcrafted mirror-work and bead torans. Limited stock available.
            </p>
            <Link href="/shop?category=festival&tag=diwali"
              className="inline-flex items-center gap-3 px-7 py-3.5 font-bold text-sm tracking-wide uppercase bg-white text-[#1c1c1c] transition-colors"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8e8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'; }}>
              Shop Diwali <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right — light gray */}
        <div className="relative overflow-hidden flex items-end bg-[#f5f5f5]">
          <img src="https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=800&q=80" alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="relative p-10 lg:p-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-[#9b9b9b]">Wedding Season</p>
            <h3 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-[#1c1c1c]">
              Bridal<br />Entrance<br />Decor
            </h3>
            <p className="text-sm leading-relaxed mb-7 max-w-xs text-[#6b6b6b]">
              Make every entrance feel sacred. Marigold, fabric &amp; mirror-work torans for your special day.
            </p>
            <Link href="/shop?category=wedding"
              className="inline-flex items-center gap-3 px-7 py-3.5 font-bold text-sm tracking-wide uppercase bg-[#1c1c1c] text-white transition-colors"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#363636'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1c1c1c'; }}>
              Shop Wedding <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-[#9b9b9b]">Reviews</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-[#1c1c1c]">What They're Saying</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-[#1c1c1c]">{'★★★★★'}</div>
              <span className="text-sm text-[#9b9b9b]">4.9 · 1,800+ verified reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((r) => (
              <div key={r.name}
                className="p-6 bg-white transition-all duration-200 border border-[#e8e8e8] hover:border-[#1c1c1c]">
                {/* Stars */}
                <div className="flex mb-4 text-[#1c1c1c]">
                  {Array(r.rating).fill(0).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                {/* Quote */}
                <p className="text-sm leading-relaxed mb-5 text-[#4a4a4a]">
                  "{r.text}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#e8e8e8]">
                  <div className="w-8 h-8 bg-[#1c1c1c] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1c1c]">{r.name}</p>
                    <p className="text-xs text-[#9b9b9b]">{r.city} · {r.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          JOURNAL (saadaa-style blog strip)
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white" style={{ borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1c1c1c]">The Journal</h2>
            <p className="text-sm text-[#9b9b9b] mt-1">Threads of artisan living</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 overflow-hidden" style={{ border: '1px solid #e8e8e8' }}>
            {[
              { title: 'The Art of Toran Making', category: 'CRAFT', img: 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=600&q=80' },
              { title: 'How Artisans Keep Traditions Alive', category: 'HERITAGE', img: 'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=600&q=80' },
              { title: 'Decorating Your Home for Diwali', category: 'FESTIVAL', img: 'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=600&q=80' },
            ].map(({ title, category, img }, i) => (
              <div key={title} className="relative overflow-hidden group cursor-pointer aspect-[4/3]"
                style={{ borderRight: i < 2 ? '1px solid #e8e8e8' : 'none' }}>
                <img src={img} alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="text-[9px] font-bold tracking-[0.2em] mb-2 text-white/60">{category}</p>
                  <p className="text-base font-bold text-white leading-tight">{title}</p>
                  <p className="text-xs mt-3 flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors">
                    Read more <ArrowRight size={10} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM TRUST BAR (saadaa marquee-style)
      ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#1c1c1c', borderTop: '1px solid #363636' }} className="overflow-hidden">
        <div className="py-3 overflow-hidden">
          <div className="animate-marquee">
            {[
              'Free Returns & Exchanges',
              'Loved by 500+ Customers',
              '100% Handcrafted by Artisans',
              'Secure Payments',
              'Free Delivery on ₹499+',
              '7-Day Easy Returns',
              'Made in India',
              'Free Returns & Exchanges',
              'Loved by 500+ Customers',
              '100% Handcrafted by Artisans',
              'Secure Payments',
              'Free Delivery on ₹499+',
              '7-Day Easy Returns',
              'Made in India',
            ].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-6 px-6 text-[10px] font-medium tracking-widest whitespace-nowrap text-white/50 uppercase">
                <span className="text-white/25">✦</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#1c1c1c]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-white/40">Stay Connected</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Join the HastKala Family</h2>
          <p className="text-base mb-10 text-white/50">
            Get early access to new collections, festival offers, and artisan stories in your inbox.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-4 text-sm outline-none bg-white/10 text-white placeholder-white/30"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <button type="submit"
              className="px-8 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap bg-white text-[#1c1c1c] transition-colors"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8e8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'; }}>
              Subscribe
            </button>
          </form>
          <p className="text-xs mt-4 text-white/25">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
