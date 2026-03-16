import Link from 'next/link';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const materials = [
  {
    name: 'Gold Jewelry',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-400',
    dos: [
      'Clean with a soft, lint-free cloth after each wear',
      'Store in the provided pouch or a soft-lined jewelry box',
      'Remove before swimming, bathing, or exercising',
      'Polish occasionally with a gold polishing cloth',
      'Get professionally cleaned once a year',
    ],
    donts: [
      'Avoid contact with perfume, hairspray, and lotions',
      'Do not use harsh chemicals or abrasive cleaners',
      'Avoid extreme heat or prolonged sun exposure',
      'Do not wear in chlorinated or salt water',
    ],
  },
  {
    name: 'Diamond Jewelry',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-400',
    dos: [
      'Clean with warm water, mild soap, and a soft toothbrush',
      'Rinse thoroughly and pat dry with a lint-free cloth',
      'Store separately to prevent scratching other pieces',
      'Have prongs checked by a jeweler every 6–12 months',
      'Use a jewelry cleaning solution made for diamonds',
    ],
    donts: [
      'Avoid touching the diamond surface (oils attract dirt)',
      'Do not clean with ultrasonic cleaners at home',
      'Avoid contact with bleach or other harsh chemicals',
      'Do not wear while doing heavy manual work',
    ],
  },
  {
    name: 'Silver Jewelry',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-400',
    dos: [
      'Polish regularly with a silver polishing cloth',
      'Store in an airtight bag or anti-tarnish pouch',
      'Clean with mild soap and warm water for light dirt',
      'Wear regularly — skin oils actually help prevent tarnish',
      'Use silver dip cleaner for heavily tarnished pieces',
    ],
    donts: [
      'Avoid exposure to air and humidity when not wearing',
      'Do not use rubber bands for storage (causes tarnish)',
      'Avoid contact with sulfur-containing substances',
      'Do not clean with toothpaste (too abrasive)',
    ],
  },
  {
    name: 'Gemstone Jewelry',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-400',
    dos: [
      'Clean gently with a soft damp cloth',
      'Store individually wrapped to prevent scratches',
      'Keep away from other hard gemstones',
      'Check settings regularly for loose stones',
    ],
    donts: [
      'Avoid soaking porous stones like pearl, opal, or turquoise',
      'Do not use steam cleaners on treated or enhanced stones',
      'Avoid ultrasonic cleaners for most gemstones',
      'Keep away from heat — it can affect colour and clarity',
    ],
  },
];

const generalTips = [
  { icon: '💧', title: 'Remove Before Water', desc: 'Always remove jewelry before swimming, showering, washing dishes, or any water activity. Water weakens metal settings and dulls gemstones.' },
  { icon: '💄', title: 'Last On, First Off', desc: 'Put your jewelry on last after applying makeup, perfume, and hairspray. Take it off first when you get home.' },
  { icon: '📦', title: 'Proper Storage', desc: 'Store each piece separately in a soft pouch or compartmented jewelry box. This prevents scratching and tangling.' },
  { icon: '🏋️', title: 'No Sports or Sleep', desc: 'Remove all jewelry before exercise, sports, or sleeping. Physical activity can bend metals and loosen stones.' },
  { icon: '🧪', title: 'Avoid Chemicals', desc: 'Household cleaning products, chlorine, and beauty products can permanently damage jewelry. Always remove before cleaning.' },
  { icon: '🔍', title: 'Regular Inspection', desc: 'Inspect your jewelry monthly for loose settings, bent prongs, or worn clasps. Early detection prevents loss of stones.' },
];

export default function CareGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#faf8f5] border-b border-gray-100 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Jewelry Care Guide</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            Fine jewelry is made to last a lifetime. With proper care, your pieces will stay as beautiful as the day you received them.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* General tips */}
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">General Care Tips</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {generalTips.map(tip => (
              <div key={tip.title} className="border border-gray-100 p-5 hover:border-gray-300 transition-colors">
                <span className="text-2xl mb-3 block">{tip.icon}</span>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">{tip.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* By material */}
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">Care by Material</h2>
          <div className="space-y-6">
            {materials.map(mat => (
              <div key={mat.name} className={`border ${mat.color} rounded-none overflow-hidden`}>
                <div className={`px-6 py-3 flex items-center gap-3 ${mat.color}`}>
                  <span className={`w-2 h-2 rounded-full ${mat.badge}`} />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">{mat.name}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white">
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-3">✓ Do</p>
                    <ul className="space-y-2">
                      {mat.dos.map(d => (
                        <li key={d} className="flex items-start gap-2.5 text-xs text-gray-600">
                          <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3">✗ Don't</p>
                    <ul className="space-y-2">
                      {mat.donts.map(d => (
                        <li key={d} className="flex items-start gap-2.5 text-xs text-gray-600">
                          <span className="w-1 h-1 rounded-full bg-red-300 mt-1.5 flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cleaning instructions */}
        <section className="border-t border-gray-100 pt-12">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Home Cleaning Instructions</h2>
          <div className="space-y-5">
            {[
              { step: '01', title: 'Prepare a cleaning solution', desc: 'Mix a few drops of mild dish soap with warm (not hot) water in a small bowl.' },
              { step: '02', title: 'Soak briefly', desc: 'Place the jewelry in the solution for 5–10 minutes. For heavily soiled pieces, soak for up to 20 minutes.' },
              { step: '03', title: 'Gently scrub', desc: 'Use a very soft toothbrush or a jewelry brush to gently clean the surface, back, and settings.' },
              { step: '04', title: 'Rinse thoroughly', desc: 'Rinse under warm running water. Make sure to remove all soap residue.' },
              { step: '05', title: 'Dry completely', desc: 'Pat dry with a soft, lint-free cloth. Allow to air dry completely before storing.' },
            ].map(s => (
              <div key={s.step} className="flex gap-5">
                <span className="font-mono text-3xl font-black text-gray-100 leading-none flex-shrink-0 w-12">{s.step}</span>
                <div className="pt-1 border-b border-gray-50 pb-4 flex-1">
                  <p className="text-sm font-bold text-gray-900 mb-1">{s.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 p-5 flex gap-4">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">Professional Cleaning Recommended</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              We recommend having your fine jewelry professionally cleaned and inspected at least once a year. Our stores offer complimentary cleaning for all Lumière purchases.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 mb-4">Have questions about caring for your jewelry?</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
            Contact Us <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
