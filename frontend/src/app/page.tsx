'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, RefreshCw, Truck, Award, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
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
      productsApi.getAll({ sort: 'popular', limit: 8 } as any),
      productsApi.getAll({ sort: 'newest',  limit: 4 } as any),
    ]).then(([pop, newer]) => {
      setFeaturedProducts(pop.data.data);
      setNewArrivals(newer.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

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
          TRUST BAR
      ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x" style={{ borderColor: '#e8e8e8' }}>
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <Icon size={18} className="flex-shrink-0 text-[#1c1c1c]" />
                <div>
                  <p className="text-xs font-bold tracking-wide uppercase text-[#1c1c1c]">{title}</p>
                  <p className="text-xs mt-0.5 text-[#9b9b9b]">{desc}</p>
                </div>
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
          BESTSELLERS
      ══════════════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2 text-[#9b9b9b]">Most Loved</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#1c1c1c]">Bestsellers</h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#1c1c1c] pb-0.5 hover:opacity-60 transition-opacity"
              style={{ borderBottom: '1px solid #1c1c1c' }}>
              View All <ArrowRight size={14} />
            </Link>
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
              {featuredProducts.map(p => (
                <div key={p.id} className="border-r border-b border-[#e8e8e8]" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
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
          NEW ARRIVALS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white" style={{ borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2 text-[#9b9b9b]">Just Arrived</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#1c1c1c]">New Arrivals</h2>
            </div>
            <Link href="/shop?sort=newest" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#1c1c1c] pb-0.5 hover:opacity-60 transition-opacity"
              style={{ borderBottom: '1px solid #1c1c1c' }}>
              See All New <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-[3/4] rounded" />
                  <div className="skeleton h-3 rounded w-2/3 mt-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap">
              {newArrivals.map(p => (
                <div key={p.id} className="border-r border-b border-[#e8e8e8]" style={{ width: '25%' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
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
