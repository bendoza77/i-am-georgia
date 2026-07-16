import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import { TESTIMONIALS } from '../../constants/content';
import { EASE } from '../../animations/variants';

export default function Testimonials() {
  const [[index, dir], setState] = useState([0, 0]);
  const t = TESTIMONIALS[index];

  const paginate = useCallback((d) => {
    setState(([i]) => [(i + d + TESTIMONIALS.length) % TESTIMONIALS.length, d]);
  }, []);

  useEffect(() => {
    const id = setInterval(() => paginate(1), 7000);
    return () => clearInterval(id);
  }, [paginate]);

  return (
    <Section className="bg-sand-50">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeader
          eyebrow="Traveller stories"
          title="Words from the road"
          lead="We measure success in the messages we get months after the trip ends."
        />

        <div className="relative min-h-[280px]">
          <Quote className="absolute -top-4 right-0 text-brand-500/15" size={90} strokeWidth={1} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.blockquote
              key={t.id}
              custom={dir}
              initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir > 0 ? -60 : 60 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative"
            >
              <div className="mb-5 flex gap-1 text-gold-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-gold-500" />
                ))}
              </div>
              <p className="font-display text-2xl leading-snug text-ink-800 sm:text-3xl text-balance">
                “{t.text}”
              </p>
              <footer className="mt-8 flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-500/20" />
                <div>
                  <p className="font-semibold text-ink-900">{t.name}</p>
                  <p className="text-sm text-ink-500">
                    {t.country} · {t.tour}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-600"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-600"
            >
              <ArrowRight size={18} />
            </button>
            <div className="ml-2 flex gap-1.5">
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setState([i, i > index ? 1 : -1])}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-7 bg-brand-500' : 'w-1.5 bg-ink-200 hover:bg-ink-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
