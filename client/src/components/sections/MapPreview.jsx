import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

const PINS = [
  { id: 'svaneti', name: 'Svaneti', x: 24, y: 28 },
  { id: 'kazbegi', name: 'Kazbegi', x: 52, y: 22 },
  { id: 'tbilisi', name: 'Tbilisi', x: 58, y: 52 },
  { id: 'kakheti', name: 'Kakheti', x: 76, y: 48 },
  { id: 'batumi', name: 'Batumi', x: 14, y: 62 },
  { id: 'vardzia', name: 'Vardzia', x: 44, y: 72 },
];

/** Stylised interactive map preview with animated pins. */
export default function MapPreview() {
  return (
    <Section className="bg-sand-100">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="The lay of the land"
            title="One country, endless routes"
            lead="From the Black Sea coast to the glaciers of the Great Caucasus, everything is within a few scenic hours. Tap a region to start dreaming."
          />
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {PINS.map((p) => (
              <li
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700"
              >
                <MapPin size={14} className="text-brand-500" /> {p.name}
              </li>
            ))}
          </ul>
          <Button to="/destinations" className="mt-9">
            Explore the map
          </Button>
        </div>

        <Reveal variant="scale">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-gradient-to-br from-sand-50 to-sand-200 shadow-[var(--shadow-lift)]">
            {/* Abstract terrain */}
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f3ecdf" />
                  <stop offset="1" stopColor="#e9dfcc" />
                </linearGradient>
              </defs>
              <path d="M4 40 Q 20 18 40 26 T 78 20 Q 94 24 96 40 Q 90 62 66 60 T 26 64 Q 6 60 4 40 Z" fill="url(#land)" stroke="#d8cbb2" strokeWidth="0.4" />
              <path d="M10 44 Q 30 34 50 40 T 90 38" fill="none" stroke="#c9b896" strokeWidth="0.3" strokeDasharray="1 1.5" />
              <path d="M18 30 L 28 24 L 34 32 L 44 26" fill="none" stroke="#b7a279" strokeWidth="0.4" />
            </svg>

            {PINS.map((p, i) => (
              <motion.button
                key={p.id}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
                aria-label={p.name}
              >
                <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-brand-500/30" />
                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow)] transition-transform group-hover:scale-125">
                  <MapPin size={14} />
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.name}
                </span>
              </motion.button>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
