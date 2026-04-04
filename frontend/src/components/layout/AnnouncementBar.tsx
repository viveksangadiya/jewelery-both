'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const MSGS = [
  { text: '✦ Free shipping on orders above ₹999', href: '/shipping' },
  { text: '✦ Use code FIRST10 for 10% off your first order', href: '/shop' },
  { text: '✦ Buy 2 get 1 free on all earrings — limited time', href: '/shop?category=earrings' },
  { text: '✦ New drop every Friday — follow us for early access', href: '/shop?sort=newest' },
];

export default function AnnouncementBar() {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx(i => (i + 1) % MSGS.length); setFading(false); }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="announcement-bar text-white py-2.5 px-4 flex items-center justify-center relative">
      <Link
        href={MSGS[idx].href}
        className={`text-[11px] font-semibold tracking-[0.12em] uppercase text-center transition-opacity duration-300 hover:opacity-80 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {MSGS[idx].text}
      </Link>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-white/50 hover:text-white transition-colors">
        <X size={13} />
      </button>
    </div>
  );
}
