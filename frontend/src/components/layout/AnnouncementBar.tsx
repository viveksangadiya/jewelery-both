'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const announcements: string[] = [
  '✨ Free shipping on orders above ₹999 | Use code FIRST10 for 10% off your first order',
  '💍 New arrivals: Diamond Ring Collection — Shop now!',
  '🎁 Buy 2 get 1 free on all earrings | Limited time offer',
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
    <div className="announcement-bar text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-between">
      <div className="flex-1 text-center animate-fade-in" key={current}>
        {announcements[current]}
      </div>
      <button onClick={() => setVisible(false)} className="ml-4 hover:opacity-70 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}
