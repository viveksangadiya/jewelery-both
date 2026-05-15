'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Ruler, ArrowRight } from 'lucide-react';

const doorSizes = [
  { name: 'Small Door Toran',    width: '60–75 cm',  height: '20–25 cm', fits: 'Bathroom / side doors' },
  { name: 'Standard Door Toran', width: '75–90 cm',  height: '25–35 cm', fits: 'Main entrance (most common)' },
  { name: 'Wide Door Toran',     width: '90–120 cm', height: '30–40 cm', fits: 'Double doors / main gate' },
  { name: 'Grand Toran',         width: '120–150 cm', height: '35–50 cm', fits: 'Mandap / ceremonial entrance' },
];

const wallHangingSizes = [
  { size: 'Mini',   dims: '20 × 30 cm',  fits: 'Shelf, mantelpiece, small corner' },
  { size: 'Small',  dims: '30 × 45 cm',  fits: 'Bedroom wall, study nook' },
  { size: 'Medium', dims: '45 × 60 cm',  fits: 'Living room accent wall' },
  { size: 'Large',  dims: '60 × 90 cm',  fits: 'Feature wall, headboard area' },
  { size: 'XL',     dims: '90 × 120 cm', fits: 'Statement piece, pooja room wall' },
];

const tabs = ['Door Toran', 'Wall Hanging', 'How to Measure'];

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero */}
      <div className="py-14 px-6 bg-brand-hover border-b border-brand-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5 bg-white border border-brand-border">
            <Ruler size={20} className="text-brand-text" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-brand-text">
            Size Guide
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-brand-secondary">
            Find the perfect size toran or wall hanging for your space.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Tabs */}
        <div className="flex mb-10 border-b border-brand-border">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className="px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
              style={{
                color: activeTab === i ? '#000' : '#999',
                borderBottom: activeTab === i ? '2px solid #000' : '2px solid transparent',
                marginBottom: '-1px',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Door Toran */}
        {activeTab === 0 && (
          <div className="space-y-10">
            <div>
              <p className="text-sm leading-relaxed mb-6 text-brand-secondary">
                Door torans are measured by width (left to right across the doorframe) and drop height (how far it hangs down). Use the table below to choose the right size for your door.
              </p>
              <div className="border border-brand-border">
                <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-brand-hover">
                  {['Type', 'Width', 'Drop Height', 'Best For'].map(h => (
                    <p key={h} className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-text">{h}</p>
                  ))}
                </div>
                {doorSizes.map((row, idx) => (
                  <div key={row.name} className="grid grid-cols-4 gap-4 px-5 py-4 items-center bg-white"
                    style={{ borderTop: idx > 0 ? '1px solid #E0D9D0' : 'none' }}>
                    <p className="text-sm font-semibold text-brand-text">{row.name}</p>
                    <p className="text-sm font-mono text-brand-secondary">{row.width}</p>
                    <p className="text-sm font-mono text-brand-secondary">{row.height}</p>
                    <p className="text-xs text-brand-muted">{row.fits}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-brand-border">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3 text-brand-muted">Common Door Widths in India</p>
              <div className="space-y-2">
                {[
                  { type: 'Bathroom / side door', width: '60–75 cm' },
                  { type: 'Bedroom door',          width: '75–80 cm' },
                  { type: 'Main entrance (single)', width: '80–90 cm' },
                  { type: 'Main entrance (double)', width: '120–150 cm' },
                ].map(({ type, width }) => (
                  <div key={type} className="flex justify-between text-xs py-1.5 border-b border-brand-border">
                    <span className="text-brand-secondary">{type}</span>
                    <span className="font-mono font-semibold text-brand-text">{width}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wall Hanging */}
        {activeTab === 1 && (
          <div className="space-y-10">
            <p className="text-sm leading-relaxed text-brand-secondary">
              Wall hangings are measured by width × height. Choose based on the wall space you want to fill — as a rule of thumb, the piece should cover 60–75% of the wall width.
            </p>
            <div className="border border-brand-border">
              <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-brand-hover">
                {['Size', 'Dimensions', 'Best For'].map(h => (
                  <p key={h} className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-text">{h}</p>
                ))}
              </div>
              {wallHangingSizes.map((row, idx) => (
                <div key={row.size} className="grid grid-cols-3 gap-4 px-5 py-4 items-center bg-white"
                  style={{ borderTop: idx > 0 ? '1px solid #E0D9D0' : 'none' }}>
                  <p className="text-sm font-bold text-brand-text">{row.size}</p>
                  <p className="text-sm font-mono text-brand-secondary">{row.dims}</p>
                  <p className="text-xs text-brand-muted">{row.fits}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Hanging Height',   desc: 'For best visual impact, hang the piece so its centre is at eye level — roughly 150–160 cm from the floor.' },
                { title: 'Wall Proportion',  desc: 'Leave at least 15–20 cm of wall space on each side of the piece for a balanced, airy look.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-white border border-brand-border">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-2 text-brand-text">{title}</p>
                  <p className="text-xs leading-relaxed text-brand-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Measure */}
        {activeTab === 2 && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-lg font-semibold mb-5 text-brand-text">
                  Measuring Your Door
                </h2>
                <div className="space-y-4">
                  {[
                    { n: '1', t: 'Measure the door width', d: 'Use a tape measure across the top of the doorframe, from one side to the other.' },
                    { n: '2', t: 'Decide on coverage', d: 'A toran that matches door width looks neat. For a fuller look, add 5–10 cm on each side.' },
                    { n: '3', t: 'Choose drop height', d: 'Standard drop is 25–35 cm. For a dramatic look, go up to 45–50 cm.' },
                    { n: '4', t: 'Match to our size chart', d: 'Compare your measurements to the Door Toran table in the previous tab.' },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4">
                      <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-brand-text text-white">
                        {s.n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{s.t}</p>
                        <p className="text-xs mt-0.5 text-brand-secondary">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-5 text-brand-text">
                  Measuring Your Wall
                </h2>
                <div className="space-y-4">
                  {[
                    { n: '1', t: 'Measure the available wall width', d: 'Mark off the space you want the piece to occupy.' },
                    { n: '2', t: 'Decide on height proportion', d: 'For most walls, a height of 40–60% of the width looks balanced.' },
                    { n: '3', t: 'Account for hanging hardware', d: 'Add 5–8 cm to the height for the loop or rod above the piece.' },
                    { n: '4', t: 'Match to our size chart', d: 'Use the Wall Hanging table to find the closest standard size.' },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4">
                      <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-brand-text text-white">
                        {s.n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{s.t}</p>
                        <p className="text-xs mt-0.5 text-brand-secondary">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 flex gap-3 bg-brand-hover border border-brand-border">
              <Ruler size={14} className="flex-shrink-0 mt-0.5 text-brand-text" />
              <p className="text-xs leading-relaxed text-brand-text">
                <strong>Tip:</strong> If your door width falls between two sizes, choose the larger size — a slightly wider toran always looks more generous and festive.
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-10 text-center border-t border-brand-border mt-12">
          <p className="text-sm mb-4 text-brand-secondary">Still unsure about your size?</p>
          <Link href="/contact" className="btn-brand h-11 px-8 inline-flex">
            Ask Our Team <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
