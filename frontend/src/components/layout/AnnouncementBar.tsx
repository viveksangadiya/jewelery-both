'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const announcements: string[] = [
  '🌸 Free shipping on orders above ₹499 | Handcrafted with love across India',
  '🎊 New Arrival: Diwali Festival Torans — Limited Stock! Shop Now',
  '🪢 Buy any 2 Torans, get 15% off | Use code TORAN15 at checkout',
];

export default function AnnouncementBar(): JSX.Element | null {
  const [current, setCurrent] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="announcement-bar text-[#FAF9EE] text-xs sm:text-sm py-2.5 px-4 flex items-center justify-between">
      <div className="flex-1 text-center animate-fade-in font-medium tracking-wide" key={current}>
        {announcements[current]}
      </div>
      <button onClick={() => setVisible(false)} className="ml-4 hover:opacity-70 transition-opacity flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
