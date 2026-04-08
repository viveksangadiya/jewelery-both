import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'Door Torans',   href: '/shop?category=door-torans' },
  { label: 'Festival',      href: '/shop?category=festival' },
  { label: 'Wedding',       href: '/shop?category=wedding' },
  { label: 'Wall Hangings', href: '/shop?category=wall-hangings' },
  { label: 'Gift Sets',     href: '/shop?category=gift-sets' },
  { label: 'Sale',          href: '/shop?sale=true' },
];

const HELP_LINKS = [
  { label: 'Track Order',        href: '/track-order' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Shipping Policy',    href: '/shipping' },
  { label: 'Size Guide',         href: '/size-guide' },
  { label: 'Care Guide',         href: '/care-guide' },
  { label: 'Contact Us',         href: '/contact' },
];

const SEO_SECTIONS = [
  {
    title: 'Popular Searches',
    links: [
      { label: 'Door Torans',        href: '/shop?category=door-torans' },
      { label: 'Traditional Torans', href: '/shop?category=door-torans&tag=traditional' },
      { label: 'Fabric Torans',      href: '/shop?category=door-torans&tag=fabric' },
      { label: 'Beaded Torans',      href: '/shop?category=door-torans&tag=beaded' },
      { label: 'Mirror Work Torans', href: '/shop?category=door-torans&tag=mirror' },
      { label: 'Festival Decor',     href: '/shop?category=festival' },
      { label: 'Wall Hangings',      href: '/shop?category=wall-hangings' },
      { label: 'Wedding Torans',     href: '/shop?category=wedding' },
      { label: 'Gift Sets',          href: '/shop?category=gift-sets' },
      { label: 'Diwali Torans',      href: '/shop?category=festival&tag=diwali' },
      { label: 'Handmade Decor',     href: '/shop?tags=handmade' },
      { label: 'Puja Decor',         href: '/shop?category=festival&tag=puja' },
    ],
  },
  {
    title: 'Festival Torans',
    links: [
      { label: 'Diwali Special Torans',  href: '/shop?category=festival&tag=diwali' },
      { label: 'Navratri Torans',        href: '/shop?category=festival&tag=navratri' },
      { label: 'Puja Decoration',        href: '/shop?category=festival&tag=puja' },
      { label: 'Holi Collection',        href: '/shop?category=festival&tag=holi' },
      { label: 'Marigold Torans',        href: '/shop?category=wedding&tag=marigold' },
      { label: 'Ganesh Chaturthi Decor', href: '/shop?category=festival&tag=ganesh' },
    ],
  },
  {
    title: 'Wedding Collection',
    links: [
      { label: 'Bridal Entrance Torans',  href: '/shop?category=wedding&tag=bridal' },
      { label: 'Marigold Wedding Torans', href: '/shop?category=wedding&tag=marigold' },
      { label: 'Floral Wedding Decor',    href: '/shop?category=wedding&tag=floral' },
      { label: 'Premium Wedding Sets',    href: '/shop?category=wedding&tag=premium' },
      { label: 'Mehendi Decor',           href: '/shop?category=wedding&tag=mehendi' },
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
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white" style={{ borderTop: '1px solid #e1e1e1' }}>

      {/* ── Main footer ─────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-[#1c1c1c] tracking-tight">HastKala</h4>
          <p className="text-xs leading-relaxed mb-6 text-[#9b9b9b]">
            Handcrafted torans &amp; decor made with love by artisans across India. Every piece tells a story.
          </p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 flex items-center justify-center text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
                style={{ border: '1px solid #e1e1e1' }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-[#1c1c1c]">Shop</h5>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map(cat => (
              <li key={cat.label}>
                <Link
                  href={cat.href}
                  className="text-xs text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-[#1c1c1c]">Help</h5>
          <ul className="space-y-2.5">
            {HELP_LINKS.map(link => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-xs text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-[#1c1c1c]">Contact</h5>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-xs text-[#9b9b9b]">
              <MapPin size={13} className="mt-0.5 flex-shrink-0" />
              <span>12 Artisan Street, Jaipur, Rajasthan 302001</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs text-[#9b9b9b]">
              <Phone size={13} className="flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs text-[#9b9b9b]">
              <Mail size={13} className="flex-shrink-0" />
              <span>hello@hastkala.in</span>
            </li>
          </ul>
          <div className="mt-6">
            <p className="text-[10px] mb-2 text-[#9b9b9b] uppercase tracking-widest">We accept</p>
            <div className="flex gap-1.5 flex-wrap">
              {['Visa', 'MC', 'UPI', 'GPay'].map(pm => (
                <span
                  key={pm}
                  className="px-2 py-1 text-[10px] text-[#9b9b9b]"
                  style={{ border: '1px solid #e1e1e1' }}
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="py-5 px-4" style={{ borderTop: '1px solid #e1e1e1' }}>
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9b9b9b]">
          <p>© 2025 HastKala. All rights reserved. Made with love in India.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[#1c1c1c] transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-[#1c1c1c] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* ── SEO links ── */}
      <div className="py-10 px-4" style={{ borderTop: '1px solid #e1e1e1' }}>
        <div className="max-w-screen-xl mx-auto space-y-7">
          {SEO_SECTIONS.map((section) => (
            <div key={section.title} className="pb-7 last:pb-0" style={{ borderBottom: '1px solid #e1e1e1' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-[#1c1c1c]">{section.title}</h3>
              <div className="flex flex-wrap items-center gap-0">
                {section.links.map((link, i) => (
                  <span key={link.label} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-xs text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
                    >
                      {link.label}
                    </Link>
                    {i < section.links.length - 1 && (
                      <span className="mx-2 text-xs text-[#e1e1e1]">|</span>
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
