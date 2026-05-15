'use client';
import Link from 'next/link';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const materials = [
  {
    name: 'Fabric & Thread Torans',
    dos: [
      'Dust gently with a soft dry cloth or feather duster',
      'Store folded in a cotton muslin bag away from moisture',
      'Air out in shade occasionally to keep colours fresh',
      'Hand wash very gently in cold water if needed',
      'Lay flat to dry in shade — never wring or twist',
    ],
    donts: [
      'Do not machine wash — threads and embellishments may loosen',
      'Avoid direct sunlight for long periods — colours will fade',
      'Do not iron directly on embroidery or mirror work',
      'Avoid plastic bags for storage — causes moisture build-up',
    ],
  },
  {
    name: 'Beaded & Mirror Work Torans',
    dos: [
      'Wipe mirrors with a slightly damp cloth to restore shine',
      'Store in a box so beads do not tangle or break',
      'Handle by the fabric base, not the bead strands',
      'Inspect periodically for loose beads and re-thread if needed',
    ],
    donts: [
      'Do not immerse in water — metal bead caps will rust',
      'Avoid dropping — glass beads and mirrors can crack',
      'Do not hang in high-humidity areas like bathrooms',
      'Avoid contact with strong chemical cleaners',
    ],
  },
  {
    name: 'Brass & Metal Accents',
    dos: [
      'Polish brass elements with a dry soft cloth after handling',
      'Use a mild brass cleaner once a year for deep shine',
      'Store in a dry place — moisture causes tarnish',
      'Rub with lemon juice + salt paste for natural polishing',
    ],
    donts: [
      'Do not use abrasive scrubbers — will scratch the surface',
      'Avoid water contact on brass bells and pendants',
      'Do not use acidic cleaners on antique or oxidised brass',
      'Avoid storing near rubber — sulphur causes rapid tarnish',
    ],
  },
  {
    name: 'Natural Material Torans',
    dos: [
      'Keep in a cool, dry, well-ventilated area',
      'Mist dry flowers lightly with hairspray to preserve shape',
      'Replace perishable elements (fresh flowers, leaves) seasonally',
      'Use silica gel packets in storage box to absorb moisture',
    ],
    donts: [
      'Do not expose dry flowers to direct water or humidity',
      'Avoid prolonged direct sunlight — natural materials bleach quickly',
      'Do not crush or stack — brittle elements will break',
      'Avoid storing in sealed airtight containers — causes mould',
    ],
  },
];

const generalTips = [
  { num: '01', title: 'Keep Away from Moisture',   desc: 'Humidity is the biggest enemy of handmade craft. Hang torans indoors and away from kitchens, bathrooms, or damp walls.' },
  { num: '02', title: 'Avoid Direct Sunlight',      desc: 'Natural dyes and fabric colours fade in prolonged UV exposure. Hang in bright but shaded spots for longest life.' },
  { num: '03', title: 'Dust Regularly',             desc: 'A gentle dusting every week keeps colours vibrant and prevents dirt from setting into threads and fabric weaves.' },
  { num: '04', title: 'Store Carefully Off-Season', desc: 'Roll (don\'t fold sharply) fabric torans and store in breathable cotton pouches inside a cool, dry cupboard.' },
  { num: '05', title: 'Handle Gently',              desc: 'Hold beaded torans from the top knot or backing fabric. Pulling bead strands directly can snap the thread.' },
  { num: '06', title: 'Inspect Before Each Season', desc: 'Before rehinging, check for loose beads, frayed threads, or tarnished metal. Small repairs done early prevent bigger damage.' },
];

export default function CareGuidePage() {
  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Hero */}
      <div className="py-14 px-6 bg-brand-hover border-b border-brand-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5 bg-white border border-brand-border">
            <Sparkles size={20} className="text-brand-text" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold mb-3 text-brand-text">
            Care Guide
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-brand-secondary italic">
            Handcrafted torans are made to be cherished for years. A little care keeps them as beautiful as the day they arrived.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-14">

        {/* General tips */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-8 text-brand-text">
            General Care Tips
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalTips.map(tip => (
              <div key={tip.title} className="p-5 bg-white border border-brand-border hover:border-brand-text transition-colors">
                <span className="text-3xl font-black block mb-3 leading-none text-brand-border font-display">
                  {tip.num}
                </span>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-2 text-brand-text">{tip.title}</p>
                <p className="text-xs leading-relaxed text-brand-secondary">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* By material */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-8 text-brand-text">
            Care by Material
          </h2>
          <div className="space-y-4">
            {materials.map((mat, idx) => (
              <div key={mat.name} className="border border-brand-border overflow-hidden">
                <div className="px-6 py-3 flex items-center gap-3 bg-brand-hover">
                  <span className="w-2 h-2 flex-shrink-0 bg-brand-text" />
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-text">{mat.name}</h3>
                </div>
                <div className="grid md:grid-cols-2 bg-white">
                  <div className="p-5 border-r border-brand-border">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3 text-green-700">✓ Do</p>
                    <ul className="space-y-2">
                      {mat.dos.map(d => (
                        <li key={d} className="flex items-start gap-2.5 text-xs text-brand-secondary">
                          <span className="w-1 h-1 flex-shrink-0 mt-1.5 bg-green-600" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3 text-red-600">✗ Don't</p>
                    <ul className="space-y-2">
                      {mat.donts.map(d => (
                        <li key={d} className="flex items-start gap-2.5 text-xs text-brand-secondary">
                          <span className="w-1 h-1 flex-shrink-0 mt-1.5 bg-red-500" />
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

        {/* Spot cleaning instructions */}
        <section className="border-t border-brand-border pt-12">
          <h2 className="font-display text-2xl font-semibold mb-6 text-brand-text">
            Spot Cleaning Instructions
          </h2>
          <div className="space-y-5">
            {[
              { step: '01', title: 'Identify the material',    desc: 'Fabric torans can be spot cleaned with water. Avoid wetting areas with beads, mirrors, or metal elements.' },
              { step: '02', title: 'Prepare a mild solution',  desc: 'Mix a small drop of gentle fabric cleaner (like Ezee or Woolite) with cool water.' },
              { step: '03', title: 'Dab — do not rub',         desc: 'Use a clean white cloth. Dab the stained area gently from the outside in. Rubbing spreads the stain and damages threads.' },
              { step: '04', title: 'Rinse with damp cloth',    desc: 'Wipe the area with a clean damp cloth to remove all soap residue.' },
              { step: '05', title: 'Dry in shade',             desc: 'Hang in a shaded, well-ventilated spot. Never use a hair dryer — heat warps beads and loosens glue on mirror work.' },
            ].map(s => (
              <div key={s.step} className="flex gap-5">
                <span className="font-display text-3xl font-black leading-none flex-shrink-0 w-12 text-brand-border">{s.step}</span>
                <div className="pt-1 flex-1 pb-4 border-b border-brand-border">
                  <p className="text-sm font-semibold mb-1 text-brand-text">{s.title}</p>
                  <p className="text-sm leading-relaxed text-brand-secondary">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <div className="p-5 flex gap-4 bg-brand-hover border border-brand-border">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-brand-muted" />
          <div>
            <p className="text-sm font-semibold mb-1 text-brand-text">When in Doubt, Contact Us</p>
            <p className="text-xs leading-relaxed text-brand-secondary">
              If your toran has a stubborn stain or structural damage (broken bead strand, torn fabric), reach out to us before attempting a repair. We may be able to advise or arrange a restoration for HastKala pieces.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm mb-4 text-brand-secondary">Have questions about caring for your toran?</p>
          <Link href="/contact" className="btn-brand h-11 px-8 inline-flex">
            Contact Us <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
