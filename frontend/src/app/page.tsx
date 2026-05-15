'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { productsApi } from '@/lib/api';

/* ─────────────────── static data ─────────────────────── */

const HERO_SLIDES = [
  {
    tag:      'New In · 2025',
    title:    'Handcrafted\nWith Devotion',
    subtitle: 'Bring the beauty of Indian artisanship to your doorstep.',
    cta:      'Shop Now',
    href:     '/shop',
    image:    'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=1600&q=90',
  },
  {
    tag:      'Festival Edit · 2025',
    title:    'Welcome the\nFestive Season',
    subtitle: 'Diwali, Navratri & every auspicious occasion.',
    cta:      'Festival Collection',
    href:     '/shop?category=festival',
    image:    'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=1600&q=90',
  },
  {
    tag:      'Wedding Special · 2025',
    title:    'Bless Every\nEntrance',
    subtitle: 'Exquisite bridal toran collections for your special day.',
    cta:      'Wedding Collection',
    href:     '/shop?category=wedding',
    image:    'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=1600&q=90',
  },
];

const CATEGORIES_ROW1 = [
  { name: 'Gifts for Her',    href: '/shop?category=gift-sets',            image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80' },
  { name: 'Door Torans',      href: '/shop?category=door-torans',          image: 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=500&q=80' },
  { name: 'Wall Hangings',    href: '/shop?category=wall-hangings',        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  { name: 'New In',           href: '/shop?sort=newest',                   image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=80' },
];

const CATEGORIES_ROW2 = [
  { name: 'Decorations',      href: '/shop?tag=decoration',               image: 'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=500&q=80' },
  { name: 'Festival Decor',   href: '/shop?category=festival',            image: 'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=500&q=80' },
  { name: 'Wedding',          href: '/shop?category=wedding',             image: 'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=500&q=80' },
  { name: 'Accessories',      href: '/shop?tag=accessories',              image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' },
];

const CATEGORIES_BOTTOM = [
  { name: 'Jewelry',      href: '/shop?category=jewelry',       image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' },
  { name: 'Wall Decor',   href: '/shop?category=wall-hangings', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  { name: 'Decorations',  href: '/shop?tag=decoration',         image: 'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=500&q=80' },
  { name: 'Accessories',  href: '/shop?tag=accessories',        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80' },
];

const EDITORIAL_CARDS = [
  {
    label:   '130 Years of Craft',
    title:   '130 Years\nof Joy',
    desc:    'Discover the journey of brightening the world since 1895, celebrating 100 years of creating joy and brilliance.',
    href:    '/about',
    image:   'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=600&q=80',
    dark:    true,
  },
  {
    label:   'Festival Twist',
    title:   'Festival\nTwist',
    desc:    'The Festival collection is crafted with vibrant materials and versatile design, featuring at least 30% reclaimed materials.',
    href:    '/shop?category=festival',
    image:   'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=600&q=80',
    dark:    false,
  },
  {
    label:   'The Story of HastKala',
    title:   'The Story of\nHastKala',
    desc:    'Discover how HastKala\'s pioneering craft tradition crafts hand-finished pieces that radiate light and elegance.',
    href:    '/about',
    image:   'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=600&q=80',
    dark:    false,
  },
];

/* ─────────────────── helpers ──────────────────────────── */

function ProductCarousel({ title, href, products, loading }: {
  title: string; href: string; products: any[]; loading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="py-14" style={{ borderTop: '1px solid #E0D9D0' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-text">{title}</h2>
          <div className="flex items-center gap-3">
            <Link href={href} className="hidden sm:block text-xs font-medium tracking-widest uppercase text-brand-secondary hover:text-brand-text transition-colors underline underline-offset-4">
              View All
            </Link>
            <button onClick={() => scroll('left')} className="w-9 h-9 border border-brand-border flex items-center justify-center hover:border-brand-text hover:bg-brand-text hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 border border-brand-border flex items-center justify-center hover:border-brand-text hover:bg-brand-text hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[220px] sm:w-[240px]" style={{ scrollSnapAlign: 'start' }}>
                  <div className="skeleton aspect-square mb-3" />
                  <div className="skeleton h-3 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))
            : products.map(p => {
                const price = parseFloat(p.sale_price || p.base_price);
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="flex-shrink-0 w-[200px] sm:w-[230px] group"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="aspect-square overflow-hidden mb-3 bg-white relative">
                      {p.primary_image
                        ? <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl bg-brand-hover">🪢</div>
                      }
                    </div>
                    <p className="text-[11px] text-brand-muted mb-1">New</p>
                    <p className="text-sm text-brand-text leading-snug line-clamp-2 mb-1">{p.name}</p>
                    <p className="text-sm text-brand-text">₹{price.toLocaleString('en-IN')}</p>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── page ─────────────────────────────── */

export default function HomePage() {
  const [slide, setSlide]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [featured, setFeatured] = useState<any[]>([]);
  const [festival, setFestival] = useState<any[]>([]);
  const [wedding, setWedding]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = (i: number) => {
    if (animating || i === slide) return;
    setAnimating(true);
    setSlide(i);
    setTimeout(() => setAnimating(false), 600);
  };
  const next = () => goTo((slide + 1) % HERO_SLIDES.length);
  const prev = () => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    autoRef.current = setInterval(next, 6000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [slide]);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ sort: 'popular', limit: 10 } as any),
      productsApi.getAll({ category: 'festival', limit: 10 } as any),
      productsApi.getAll({ category: 'wedding',  limit: 10 } as any),
    ]).then(([pop, fest, wed]) => {
      setFeatured(pop.data.data);
      setFestival(fest.data.data);
      setWedding(wed.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hero = HERO_SLIDES[slide];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F5F0EB' }}>

      {/* ══════════════════════════════════════
          1. HERO — full-width campaign banner
      ══════════════════════════════════════ */}
      <section className="relative w-full h-[70vh] min-h-[480px] max-h-[820px] overflow-hidden">

        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
          </div>
        ))}

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-14 pb-12 sm:pb-16">
          <div key={slide} className="animate-fade-in max-w-xl">
            <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-white/70 mb-4">{hero.tag}</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight mb-4">
              {hero.title.split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
            </h1>
            <p className="text-sm text-white/70 mb-8 max-w-sm">{hero.subtitle}</p>
            <div className="flex items-center gap-6">
              <Link
                href={hero.href}
                className="btn-brand"
                style={{ minWidth: '140px' }}
              >
                {hero.cta}
              </Link>
              <Link href="/shop" className="text-xs text-white/70 hover:text-white tracking-widest uppercase underline underline-offset-4 transition-colors">
                Discover more
              </Link>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white transition-colors">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 right-6 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-px transition-all duration-300"
              style={{ width: i === slide ? '28px' : '12px', backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. BRAND STORY
      ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 text-center px-6" style={{ backgroundColor: '#F5F0EB' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase text-brand-muted mb-5 font-medium">
            Handcrafted Since 2018
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-text leading-snug mb-6">
            Masters of Craft &amp; Tradition
          </h2>
          <p className="text-sm leading-relaxed text-brand-secondary max-w-xl mx-auto mb-8">
            Since 2018, HastKala's passion for artisan craft and design, and mastery of traditional techniques has defined us as the leading torans and accessories brand, supporting skilled craftspeople across India.
          </p>
          <Link href="/about" className="text-xs tracking-widest uppercase font-medium text-brand-text underline underline-offset-4 hover:text-brand-secondary transition-colors">
            Discover more
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. SHOP BY CATEGORY — row 1 (4 tiles)
      ══════════════════════════════════════ */}
      <section className="pb-2 px-4 sm:px-6 max-w-screen-xl mx-auto" style={{ borderTop: '1px solid #E0D9D0' }}>
        <div className="pt-12 pb-6">
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-text text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES_ROW1.map(cat => (
              <Link key={cat.name} href={cat.href} className="group block">
                <div className="aspect-square overflow-hidden bg-brand-hover mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-sm text-brand-text text-center font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES_ROW2.map(cat => (
              <Link key={cat.name} href={cat.href} className="group block">
                <div className="aspect-square overflow-hidden bg-brand-hover mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-sm text-brand-text text-center font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. COLLECTION CAROUSEL 1
      ══════════════════════════════════════ */}
      <ProductCarousel
        title="Embrace the Festival"
        href="/shop?category=festival"
        products={festival}
        loading={loading}
      />

      {/* ══════════════════════════════════════
          5. COLLECTION CAROUSEL 2
      ══════════════════════════════════════ */}
      <ProductCarousel
        title="Best Sellers"
        href="/shop?sort=popular"
        products={featured}
        loading={loading}
      />

      {/* ══════════════════════════════════════
          6. GIFT EDITORIAL BANNER
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '300px', borderTop: '1px solid #E0D9D0' }}>
        <img
          src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&q=80"
          alt="Gift Ideas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-screen-xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/70 mb-4 font-medium">Gift Ideas</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4 max-w-lg leading-snug">
            The perfect gift for every occasion
          </h2>
          <p className="text-sm text-white/70 mb-8 max-w-sm leading-relaxed">
            Find a gift to give someone close to you in precious metals and handcrafted stones. Set in beautiful designs, crafted beautifully for festivities.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/shop?category=gift-sets" className="btn-brand" style={{ background: '#fff', color: '#000' }}>
              Shop Gifts
            </Link>
            <Link href="/shop" className="btn-brand-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              Discover more
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. SHOP BY CATEGORY — row 2 (4 tiles)
      ══════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 max-w-screen-xl mx-auto" style={{ borderTop: '1px solid #E0D9D0' }}>
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-text text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES_BOTTOM.map(cat => (
            <Link key={cat.name} href={cat.href} className="group block">
              <div className="aspect-square overflow-hidden bg-brand-hover mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="text-sm text-brand-text text-center font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. WEDDING CAROUSEL
      ══════════════════════════════════════ */}
      <ProductCarousel
        title="Wedding Collection"
        href="/shop?category=wedding"
        products={wedding}
        loading={loading}
      />

      {/* ══════════════════════════════════════
          9. WORLD OF HASTKALA — 3 editorial cards
      ══════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 max-w-screen-xl mx-auto" style={{ borderTop: '1px solid #E0D9D0' }}>
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-text text-center mb-10">World of HastKala</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EDITORIAL_CARDS.map(card => (
            <Link key={card.label} href={card.href} className="group block relative overflow-hidden">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {card.dark && <div className="absolute inset-0 bg-black/40" />}
              </div>
              <div className={`p-5 ${card.dark ? 'bg-brand-dark text-white' : 'bg-white text-brand-text'}`}>
                <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 font-medium ${card.dark ? 'text-white/60' : 'text-brand-muted'}`}>
                  {card.label}
                </p>
                <h3 className={`font-serif text-xl leading-snug mb-3 ${card.dark ? 'text-white' : 'text-brand-text'}`}>
                  {card.title.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </h3>
                <p className={`text-xs leading-relaxed mb-4 ${card.dark ? 'text-white/60' : 'text-brand-secondary'}`}>
                  {card.desc}
                </p>
                <span className={`text-xs font-medium tracking-widest uppercase underline underline-offset-4 ${card.dark ? 'text-white' : 'text-brand-text'}`}>
                  Discover more
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          10. SERVICES STRIP
      ══════════════════════════════════════ */}
      <section className="py-14 px-4" style={{ borderTop: '1px solid #E0D9D0', backgroundColor: '#F5F0EB' }}>
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { icon: '💬', title: 'CUSTOMER SERVICE LIVE CHAT',   desc: 'Need help? Speak to our Customer Service team.' },
            { icon: '📅', title: 'BOOK AN APPOINTMENT IN STORE', desc: 'Book an appointment with our Artisan Experts in your local store.' },
            { icon: '📦', title: 'CUSTOMER SERVICE',             desc: 'Explore answers to our FAQs or connect with our Customer Service…' },
            { icon: '🎁', title: 'GIFT SERVICES',                desc: 'Add a personalized touch' },
          ].map(s => (
            <div key={s.title} className="flex flex-col items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-brand-text leading-relaxed">{s.title}</p>
              <p className="text-[11px] text-brand-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          11. NEWSLETTER / CLUB SIGNUP
      ══════════════════════════════════════ */}
      <section className="py-16 px-6 text-center bg-black border-t border-brand-border">
        <div className="max-w-xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/60 mb-3 font-medium">
            Sign up and get 10% off*
          </p>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            Be first to receive updates on new collections, style inspiration, gift ideas and exclusive promotions. Sign up to the HastKala Club today and enjoy a personalised touch.
          </p>
          <Link href="/account/login" className="btn-brand inline-flex" style={{ minWidth: '180px', background: '#fff', color: '#000' }}>
            Join the Club
          </Link>
          <p className="text-[10px] text-white/30 mt-4">
            *Terms and conditions apply
          </p>
        </div>
      </section>

    </div>
  );
}
