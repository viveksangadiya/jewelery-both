import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube, Music2 } from 'lucide-react';

const CUSTOMER_SERVICE = [
  { label: 'Customer Service Overview', href: '/contact' },
  { label: 'Order Status',              href: '/track-order' },
  { label: 'Shipping',                  href: '/shipping' },
  { label: 'Returns & Exchange',        href: '/returns' },
  { label: 'Contact Us',                href: '/contact' },
  { label: 'Size Guide',                href: '/size-guide' },
  { label: 'Care Guide',                href: '/care-guide' },
  { label: 'Store Finder',              href: '/store-finder' },
];

const MEMBERSHIP = [
  { label: 'Register',              href: '/account/login' },
  { label: 'HastKala Club',         href: '/account' },
  { label: 'Benefits & Rewards',    href: '/account' },
];

const ABOUT_US = [
  { label: 'About HastKala',        href: '/about' },
  { label: 'Our Artisans',          href: '/artisans' },
  { label: 'Jobs & Careers',        href: '/careers' },
  { label: 'For Professionals',     href: '/professionals' },
  { label: 'Sitemap',               href: '/sitemap' },
  { label: 'Code of Conduct',       href: '/code-of-conduct' },
];

const LEGAL = [
  { label: 'Terms of Use',      href: '/terms' },
  { label: 'Terms & Conditions',href: '/terms' },
  { label: 'Privacy Policy',    href: '/privacy' },
  { label: 'Cookie Consent',    href: '/privacy#cookies' },
  { label: 'Imprint',           href: '/imprint' },
];

const SOCIAL = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook' },
  { Icon: Twitter,   href: '#', label: 'X / Twitter' },
  { Icon: Youtube,   href: '#', label: 'YouTube' },
  { Icon: Music2,    href: '#', label: 'TikTok' },
];

export default function Footer() {
  return (
    <footer>

      {/* ── Services strip ────────────────────────────── */}
      <div className="bg-brand-bg border-t border-brand-border py-10 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { icon: '💬', title: 'CUSTOMER SERVICE LIVE CHAT', sub: 'Need help?\nSpeak to our Customer Service team' },
            { icon: '📅', title: 'BOOK AN APPOINTMENT IN STORE', sub: 'Book an appointment with our Artisan Experts in your local store.' },
            { icon: '📦', title: 'CUSTOMER SERVICE', sub: 'Explore answers to our FAQs or connect with our Customer Service…' },
            { icon: '🎁', title: 'GIFT SERVICES', sub: 'Add a personalized touch' },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-text leading-relaxed">
                {item.title}
              </p>
              <p className="text-[11px] text-brand-secondary leading-relaxed whitespace-pre-line">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main dark footer ──────────────────────────── */}
      <div className="bg-brand-footer">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-10">

          {/* Customer Service */}
          <div>
            <h5 className="text-[10px] font-medium uppercase tracking-[0.2em] mb-5 text-white">
              Customer Service & FAQ
            </h5>
            <ul className="space-y-3">
              {CUSTOMER_SERVICE.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Membership */}
          <div>
            <h5 className="text-[10px] font-medium uppercase tracking-[0.2em] mb-5 text-white">
              Membership
            </h5>
            <ul className="space-y-3">
              {MEMBERSHIP.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h5 className="text-[10px] font-medium uppercase tracking-[0.2em] mb-5 text-white">
              About Us
            </h5>
            <ul className="space-y-3">
              {ABOUT_US.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-[10px] font-medium uppercase tracking-[0.2em] mb-5 text-white">
              Legal
            </h5>
            <ul className="space-y-3">
              {LEGAL.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Language + Copyright ── */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>🌐</span>
            <span>India</span>
            <span className="text-white/20">|</span>
            <span>English</span>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} HastKala. All rights reserved. Handmade in India.
          </p>
          <div className="flex items-center gap-1">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20 text-xs mx-1">|</span>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* ── Black brand bar ───────────────────────────── */}
      <div className="bg-black py-5 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">

          {/* Left spacer */}
          <div className="w-32" />

          {/* Centered brand name */}
          <Link href="/" className="font-display text-2xl tracking-[0.18em] text-white uppercase font-normal">
            HastKala
          </Link>

          {/* Social icons */}
          <div className="flex items-center gap-3 w-32 justify-end">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white/40 hover:text-white transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
