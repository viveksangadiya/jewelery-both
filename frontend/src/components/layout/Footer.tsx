import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

// ── SEO search links — exactly like Kisna's "Popular Searches" section ──
const SEO_SECTIONS = [
  {
    title: 'Popular Searches',
    links: [
      { label: 'Rings', href: '/shop?category=rings' },
      { label: 'Daily Wear Rings', href: '/shop?category=rings&tags=daily' },
      { label: 'Earrings', href: '/shop?category=earrings' },
      { label: 'Mangalsutra', href: '/shop?category=mangalsutra' },
      { label: 'Bracelets', href: '/shop?category=bracelets' },
      { label: 'Bangles', href: '/shop?category=bangles' },
      { label: 'Pendants', href: '/shop?category=pendants' },
      { label: 'Necklace', href: '/shop?category=necklaces' },
      { label: 'Gold Jewellery', href: '/shop?material=gold' },
      { label: 'Diamond Jewellery', href: '/shop?material=diamond' },
      { label: 'Gemstone Jewellery', href: '/shop?material=gemstone' },
      { label: 'Sets', href: '/shop?category=sets' },
    ],
  },
  {
    title: 'Gold Jewellery',
    links: [
      { label: 'Gold Bracelets', href: '/shop?category=bracelets&material=gold' },
      { label: 'Gold Rings For Women', href: '/shop?category=rings&material=gold&gender=female' },
      { label: 'Gold Necklace Latest Design', href: '/shop?category=necklaces&material=gold&sort=newest' },
      { label: 'Latest Gold Ring Design', href: '/shop?category=rings&material=gold&sort=newest' },
      { label: 'Gold Earrings', href: '/shop?category=earrings&material=gold' },
      { label: 'Gold Ring For Women', href: '/shop?category=rings&material=gold' },
      { label: 'Gold Necklace', href: '/shop?category=necklaces&material=gold' },
      { label: 'Gold Bangles', href: '/shop?category=bangles&material=gold' },
      { label: 'Gold Pendants', href: '/shop?category=pendants&material=gold' },
    ],
  },
  {
    title: 'Diamond Jewellery',
    links: [
      { label: 'Diamond Pendants', href: '/shop?category=pendants&material=diamond' },
      { label: 'Diamond Mangalsutra', href: '/shop?category=mangalsutra&material=diamond' },
      { label: 'Diamond Necklace', href: '/shop?category=necklaces&material=diamond' },
      { label: 'Diamond Bracelets', href: '/shop?category=bracelets&material=diamond' },
      { label: 'Diamond Ring For Women', href: '/shop?category=rings&material=diamond&gender=female' },
      { label: 'Diamond Earrings', href: '/shop?category=earrings&material=diamond' },
      { label: 'Diamond Bracelets For Women', href: '/shop?category=bracelets&material=diamond&gender=female' },
      { label: 'Diamond Rings', href: '/shop?category=rings&material=diamond' },
      { label: 'Diamond Nose Wear', href: '/shop?category=nose-wear&material=diamond' },
    ],
  },
  {
    title: "Women's Jewellery",
    links: [
      { label: 'Rings For Women', href: '/shop?category=rings&gender=female' },
      { label: 'Earrings For Women', href: '/shop?category=earrings&gender=female' },
      { label: 'Necklace For Women', href: '/shop?category=necklaces&gender=female' },
      { label: 'Bracelets For Women', href: '/shop?category=bracelets&gender=female' },
      { label: 'Bangles For Women', href: '/shop?category=bangles&gender=female' },
      { label: 'Mangalsutra For Women', href: '/shop?category=mangalsutra&gender=female' },
    ],
  },
  {
    title: "Men's Jewellery",
    links: [
      { label: 'Gold Rings For Men', href: '/shop?category=rings&gender=male&material=gold' },
      { label: 'Band Ring For Men', href: '/shop?category=rings&tags=band&gender=male' },
      { label: 'Ring For Men', href: '/shop?category=rings&gender=male' },
      { label: 'Gold Pendants For Men', href: '/shop?category=pendants&gender=male&material=gold' },
      { label: 'Bracelets For Men', href: '/shop?category=bracelets&gender=male' },
      { label: 'Chain For Men', href: '/shop?category=chain&gender=male' },
    ],
  },
];

export default function Footer() {
  return (
    <footer>
      {/* ── Main footer — dark bg ─────────────────────── */}
      <div className="bg-charcoal text-white">
        {/* Newsletter */}
        <div className="bg-yellow-700 py-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-2xl font-bold mb-2">Join the Lumière Circle</h3>
            <p className="text-yellow-100 text-sm mb-6">Get exclusive offers, new arrivals, and jewelry care tips in your inbox.</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button className="px-6 py-3 bg-charcoal hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h4 className="font-display text-xl font-bold mb-4">
              Lumière<span className="text-yellow-400">✦</span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Crafting timeless jewelry that celebrates life's beautiful moments.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-700 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Shop</h5>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Sets'].map(cat => (
                <li key={cat}>
                  <Link href={`/shop?category=${cat.toLowerCase()}`} className="hover:text-yellow-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Help</h5>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                { label: 'Track Order', href: '/track-order' },
                { label: 'Returns & Exchange', href: '/returns' },
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Care Guide', href: '/care-guide' },
                { label: 'Contact Us', href: '/contact' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-yellow-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Contact</h5>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>123 Jeweler's Lane, Mumbai, Maharashtra 400001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-yellow-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-yellow-500 flex-shrink-0" />
                <span>hello@lumierejewels.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">We accept</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'MC', 'UPI', 'GPay'].map(pm => (
                  <span key={pm} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">{pm}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© 2025 Lumière Jewels. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO links section — white bg, below footer, exactly like Kisna ── */}
      <div className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-7">
          {SEO_SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-gray-100 pb-7 last:border-0 last:pb-0">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{section.title}</h3>
              <div className="flex flex-wrap items-center gap-0">
                {section.links.map((link, i) => (
                  <span key={link.label} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                    {i < section.links.length - 1 && (
                      <span className="text-gray-300 mx-2 text-xs">|</span>
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
