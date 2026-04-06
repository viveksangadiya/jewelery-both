import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const SEO_SECTIONS = [
  {
    title: 'Popular Searches',
    links: [
      { label: 'Door Torans',          href: '/shop?category=door-torans' },
      { label: 'Traditional Torans',   href: '/shop?category=door-torans&tag=traditional' },
      { label: 'Fabric Torans',        href: '/shop?category=door-torans&tag=fabric' },
      { label: 'Beaded Torans',        href: '/shop?category=door-torans&tag=beaded' },
      { label: 'Mirror Work Torans',   href: '/shop?category=door-torans&tag=mirror' },
      { label: 'Festival Decor',       href: '/shop?category=festival' },
      { label: 'Wall Hangings',        href: '/shop?category=wall-hangings' },
      { label: 'Wedding Torans',       href: '/shop?category=wedding' },
      { label: 'Gift Sets',            href: '/shop?category=gift-sets' },
      { label: 'Diwali Torans',        href: '/shop?category=festival&tag=diwali' },
      { label: 'Handmade Decor',       href: '/shop?tags=handmade' },
      { label: 'Puja Decor',           href: '/shop?category=festival&tag=puja' },
    ],
  },
  {
    title: 'Festival Torans',
    links: [
      { label: 'Diwali Special Torans',   href: '/shop?category=festival&tag=diwali' },
      { label: 'Navratri Torans',         href: '/shop?category=festival&tag=navratri' },
      { label: 'Puja Decoration',         href: '/shop?category=festival&tag=puja' },
      { label: 'Holi Collection',         href: '/shop?category=festival&tag=holi' },
      { label: 'Marigold Torans',         href: '/shop?category=wedding&tag=marigold' },
      { label: 'New Year Torans',         href: '/shop?category=festival&tag=new-year' },
      { label: 'Ganesh Chaturthi Decor',  href: '/shop?category=festival&tag=ganesh' },
      { label: 'Janmashtami Decor',       href: '/shop?category=festival&tag=janmashtami' },
    ],
  },
  {
    title: 'Wedding Collection',
    links: [
      { label: 'Bridal Entrance Torans',    href: '/shop?category=wedding&tag=bridal' },
      { label: 'Marigold Wedding Torans',   href: '/shop?category=wedding&tag=marigold' },
      { label: 'Floral Wedding Decor',      href: '/shop?category=wedding&tag=floral' },
      { label: 'Premium Wedding Sets',      href: '/shop?category=wedding&tag=premium' },
      { label: 'Reception Decor Torans',    href: '/shop?category=wedding&tag=reception' },
      { label: 'Mehendi Decor',             href: '/shop?category=wedding&tag=mehendi' },
    ],
  },
  {
    title: 'By Style',
    links: [
      { label: 'Tassel Torans',      href: '/shop?tag=tassel' },
      { label: 'Macrame Torans',     href: '/shop?tag=macrame' },
      { label: 'Boho Wall Hangings', href: '/shop?tag=boho' },
      { label: 'Rajasthani Style',   href: '/shop?tag=rajasthani' },
      { label: 'Gujarati Torans',    href: '/shop?tag=gujarati' },
      { label: 'Warli Art Torans',   href: '/shop?tag=warli' },
    ],
  },
];

export default function Footer() {
  return (
    <footer>
      {/* ── Main footer ─────────────────────────── */}
      <div style={{ backgroundColor: '#1c1c1c', color: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">HastKala</h4>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Handcrafted torans &amp; decor made with love by artisans across India. Every piece tells a story.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 flex items-center justify-center transition-colors rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h5 className="font-semibold mb-4 text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Shop</h5>
            <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {[
                { label: 'Door Torans',   href: '/shop?category=door-torans' },
                { label: 'Festival',      href: '/shop?category=festival' },
                { label: 'Wedding',       href: '/shop?category=wedding' },
                { label: 'Wall Hangings', href: '/shop?category=wall-hangings' },
                { label: 'Gift Sets',     href: '/shop?category=gift-sets' },
                { label: 'Sale',          href: '/shop?sale=true' },
              ].map(cat => (
                <li key={cat.label}>
                  <Link href={cat.href} className="hover:text-white transition-colors">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h5 className="font-semibold mb-4 text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Help</h5>
            <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {[
                { label: 'Track Order',        href: '/track-order' },
                { label: 'Returns & Exchange', href: '/returns' },
                { label: 'Shipping Policy',    href: '/shipping' },
                { label: 'Size Guide',         href: '/size-guide' },
                { label: 'Care Guide',         href: '/care-guide' },
                { label: 'Contact Us',         href: '/contact' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-4 text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Contact</h5>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span>12 Artisan Street, Jaipur, Rajasthan 302001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span>hello@hastkala.in</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>We accept</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'MC', 'UPI', 'GPay'].map(pm => (
                  <span key={pm} className="px-2 py-1 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-5 px-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p>© 2025 HastKala. All rights reserved. Made with love in India.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO links ── */}
      <div className="bg-white border-t py-10 px-4" style={{ borderColor: '#e8e8e8' }}>
        <div className="max-w-7xl mx-auto space-y-7">
          {SEO_SECTIONS.map((section) => (
            <div key={section.title} className="border-b pb-7 last:border-0 last:pb-0" style={{ borderColor: '#e8e8e8' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#1c1c1c' }}>{section.title}</h3>
              <div className="flex flex-wrap items-center gap-0">
                {section.links.map((link, i) => (
                  <span key={link.label} className="flex items-center">
                    <Link href={link.href} className="text-sm transition-colors" style={{ color: '#9b9b9b' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#1c1c1c')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9b9b9b')}>
                      {link.label}
                    </Link>
                    {i < section.links.length - 1 && (
                      <span className="mx-2 text-xs" style={{ color: '#e8e8e8' }}>|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
