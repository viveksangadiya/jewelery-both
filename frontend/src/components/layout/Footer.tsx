import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';

const LINKS = {
  Shop: [
    { label: 'Rings',        href: '/shop?category=rings' },
    { label: 'Necklaces',    href: '/shop?category=necklaces' },
    { label: 'Earrings',     href: '/shop?category=earrings' },
    { label: 'Bracelets',    href: '/shop?category=bracelets' },
    { label: 'Bridal Sets',  href: '/shop?tags=bridal' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Sale',         href: '/shop?sale=true' },
  ],
  Help: [
    { label: 'Shipping Policy',    href: '/shipping' },
    { label: 'Returns & Exchange', href: '/returns' },
    { label: 'Size Guide',         href: '/size-guide' },
    { label: 'Jewelry Care',       href: '/care-guide' },
    { label: 'Track Order',        href: '/track-order' },
    { label: 'Contact Us',         href: '/contact' },
  ],
  Company: [
    { label: 'About Us',       href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Careers',        href: '#' },
    { label: 'Press',          href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-jet text-white">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-sans font-extrabold text-2xl tracking-tight">Lumière ✦</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6 font-light">
              Fine jewelry for real life. Gold-plated, tarnish-resistant, made for everyday wear.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-colors">
                <Youtube size={16} />
              </a>
              {/* Pinterest */}
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-colors text-sm font-bold">
                P
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FF4D4D] mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors font-light">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2025 Lumière Jewels Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <Link key={t} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* SEO links */}
      <div className="border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {['Gold Rings', 'Diamond Earrings', 'Mangalsutra', 'Wedding Jewelry', 'Silver Jewelry', 'Platinum Rings', 'Pearl Necklace', 'Bridal Sets', 'Gold Bangles', 'Anniversary Gifts'].map(t => (
              <Link key={t} href={`/shop?search=${t.toLowerCase().replace(/ /g, '+')}`}
                className="text-[10px] text-white/15 hover:text-white/35 transition-colors">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
