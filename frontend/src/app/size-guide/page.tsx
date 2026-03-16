'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Ruler, ArrowRight } from 'lucide-react';

const ringSizes = [
  { us: '4',   uk: 'H',  eu: '46.5', diameter: '14.8mm', circumference: '46.5mm' },
  { us: '4.5', uk: 'I',  eu: '48',   diameter: '15.3mm', circumference: '48.0mm' },
  { us: '5',   uk: 'J',  eu: '49',   diameter: '15.7mm', circumference: '49.3mm' },
  { us: '5.5', uk: 'K',  eu: '50.5', diameter: '16.1mm', circumference: '50.6mm' },
  { us: '6',   uk: 'L',  eu: '51.5', diameter: '16.5mm', circumference: '51.9mm' },
  { us: '6.5', uk: 'M',  eu: '52.5', diameter: '16.9mm', circumference: '53.1mm' },
  { us: '7',   uk: 'N',  eu: '54',   diameter: '17.3mm', circumference: '54.4mm' },
  { us: '7.5', uk: 'O',  eu: '55',   diameter: '17.7mm', circumference: '55.7mm' },
  { us: '8',   uk: 'P',  eu: '57',   diameter: '18.2mm', circumference: '57.0mm' },
  { us: '8.5', uk: 'Q',  eu: '58',   diameter: '18.6mm', circumference: '58.3mm' },
  { us: '9',   uk: 'R',  eu: '59',   diameter: '19.0mm', circumference: '59.5mm' },
  { us: '9.5', uk: 'S',  eu: '60.5', diameter: '19.4mm', circumference: '60.8mm' },
  { us: '10',  uk: 'T',  eu: '62',   diameter: '19.8mm', circumference: '62.1mm' },
];

const braceletSizes = [
  { size: 'XS', wrist: '13–14cm', fits: 'Very petite wrist' },
  { size: 'S',  wrist: '14–15cm', fits: 'Petite wrist' },
  { size: 'M',  wrist: '15–17cm', fits: 'Average wrist (most common)' },
  { size: 'L',  wrist: '17–18cm', fits: 'Larger wrist' },
  { size: 'XL', wrist: '18–20cm', fits: 'Very large wrist' },
];

const necklaceLengths = [
  { length: '14" (35cm)', style: 'Choker', desc: 'Sits snugly around the neck' },
  { length: '16" (40cm)', style: 'Collar',  desc: 'Sits at the collarbone — most popular' },
  { length: '18" (45cm)', style: 'Princess', desc: 'Hangs just below the collarbone' },
  { length: '20" (50cm)', style: 'Matinee', desc: 'Falls to the upper chest' },
  { length: '22" (55cm)', style: 'Opera',   desc: 'Falls to the bust line' },
  { length: '24" (60cm)', style: 'Rope',    desc: 'Falls below the bust' },
];

const tabs = ['Ring Size', 'Bracelet Size', 'Necklace Length'];

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#faf8f5] border-b border-gray-100 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Ruler size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Size Guide</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            Finding your perfect fit is easy. Use our guides below for rings, bracelets, and necklaces.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-10">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                activeTab === i
                  ? 'border-b-2 border-gray-900 text-gray-900 -mb-px'
                  : 'text-gray-400 hover:text-gray-700'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Ring Size */}
        {activeTab === 0 && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* How to measure */}
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-5">How to Measure</h2>
                <div className="space-y-4">
                  {[
                    { n: '1', t: 'Use a strip of paper or string', d: 'Cut a thin strip about 10cm long.' },
                    { n: '2', t: 'Wrap around your finger', d: 'Wrap it snugly around the base of the finger you want to measure.' },
                    { n: '3', t: 'Mark the overlap', d: 'Mark where the paper overlaps with a pen.' },
                    { n: '4', t: 'Measure the length', d: 'Lay flat and measure the length in mm — this is your circumference.' },
                    { n: '5', t: 'Find your size', d: 'Match your circumference to the table opposite.' },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4">
                      <span className="w-6 h-6 bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">{s.n}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.t}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Tip:</strong> Measure at the end of the day when your fingers are at their largest. If between sizes, choose the larger size.
                  </p>
                </div>
              </div>

              {/* Size visual */}
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-4xl font-black text-gray-300">⌀</p>
                    <p className="text-xs text-gray-400 mt-1">Inner Diameter</p>
                  </div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-px bg-gray-400" />
                      <p className="text-[10px] text-gray-500 font-mono">mm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Size chart */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Ring Size Chart</h2>
              <div className="border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['US Size', 'UK Size', 'EU Size', 'Diameter', 'Circumference'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ringSizes.map((r, i) => (
                      <tr key={r.us} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.us}</td>
                        <td className="px-4 py-3 text-gray-600">{r.uk}</td>
                        <td className="px-4 py-3 text-gray-600">{r.eu}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.diameter}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.circumference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bracelet Size */}
        {activeTab === 1 && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-5">How to Measure</h2>
                <div className="space-y-4">
                  {[
                    { n: '1', t: 'Use a soft measuring tape', d: 'Or a strip of paper/string.' },
                    { n: '2', t: 'Wrap around your wrist', d: 'Measure just below the wrist bone.' },
                    { n: '3', t: 'Note the measurement', d: 'In centimetres — this is your wrist size.' },
                    { n: '4', t: 'Add comfort allowance', d: 'Add 1–2cm for a comfortable fit, 2–3cm for a loose fit.' },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4">
                      <span className="w-6 h-6 bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">{s.n}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.t}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-gray-100 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4">Fit Preference</h3>
                <div className="space-y-3">
                  {[
                    { fit: 'Snug Fit', add: 'Add 0.5–1cm' },
                    { fit: 'Comfortable Fit', add: 'Add 1–2cm' },
                    { fit: 'Loose Fit', add: 'Add 2–3cm' },
                  ].map(({ fit, add }) => (
                    <div key={fit} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{fit}</span>
                      <span className="text-xs font-mono text-gray-500">{add}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Bracelet Size Chart</h2>
              <div className="border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Size', 'Wrist Circumference', 'Best For'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {braceletSizes.map((b, i) => (
                      <tr key={b.size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{b.size}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{b.wrist}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-sm">{b.fits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Necklace Length */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
              Necklace length determines where it sits on your body. Use this guide to choose the right length for your style and neckline.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {necklaceLengths.map(n => (
                <div key={n.length} className="border border-gray-100 p-5 hover:border-gray-300 transition-colors">
                  <p className="font-mono text-sm font-bold text-gray-900 mb-1">{n.length}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{n.style}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Note:</strong> The length shown is the total length of the necklace. The pendant will hang from the centre, so it will sit slightly lower than the chain end.
              </p>
            </div>
          </div>
        )}

        {/* Still unsure */}
        <div className="border-t border-gray-100 pt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">Still unsure about your size?</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
            Ask Our Experts <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
