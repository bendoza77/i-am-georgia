import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import Button from '../ui/Button';
import AnimatedText from '../ui/AnimatedText';
import Reveal from '../ui/Reveal';
import { unsplash } from '../../utils/image';

export default function CTA() {
  return (
    <section className="container-x py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-[var(--radius-3xl)] bg-ink-950 px-6 py-20 text-center sm:px-12 lg:py-28">
        <div className="absolute inset-0">
          <img
            src={unsplash('1464822759023-fed622ff2c3b', { w: 2000, q: 75 })}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/60 to-ink-950/90" />
        </div>
        <div className="pointer-events-none absolute -right-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-600/30 blur-[100px]" />

        <motion.div
          animate={{ x: [0, 12, 0], y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-[var(--shadow-glow)]"
        >
          <Plane size={28} className="rotate-45" />
        </motion.div>

        <AnimatedText
          text="Your Georgia is waiting"
          className="justify-center font-display text-4xl text-white sm:text-6xl lg:text-7xl"
        />

        <Reveal variant="up" delay={0.15}>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-white/70 text-pretty">
            Tell us your dates and your dreams. We’ll compose a journey that feels like it was
            made only for you — because it will be.
          </p>
        </Reveal>

        <Reveal variant="up" delay={0.25}>
          <div className="relative mt-10 flex flex-wrap justify-center gap-4">
            <Button to="/tours" size="lg">
              Start planning
            </Button>
            <Button to="/contact" size="lg" variant="glassDark">
              Talk to a local expert
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
