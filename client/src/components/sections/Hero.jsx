import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Plane, Star } from 'lucide-react';
import { unsplash } from '../../utils/image';
import Button from '../ui/Button';
import { EASE } from '../../animations/variants';

const HERO_BG = unsplash('1589308078059-be1415eab4c3', { w: 2400, q: 82 });

/** Soft drifting cloud blob. */
function Cloud({ className, delay = 0, duration = 60 }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={{ x: '-10%' }}
      animate={{ x: '110%' }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      <div className="h-full w-full rounded-full bg-white/40 blur-3xl" />
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.28]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 1.7 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink-950">
      {/* Parallax background */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 will-change-transform">
        <img src={HERO_BG} alt="Gergeti Trinity Church beneath Mount Kazbek, Georgia" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/25 to-ink-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/50 to-transparent" />
      </motion.div>

      {/* Drifting clouds */}
      <Cloud className="absolute left-0 top-[22%] h-24 w-72" duration={70} />
      <Cloud className="absolute left-0 top-[40%] h-16 w-56" delay={12} duration={90} />
      <Cloud className="absolute left-0 top-[12%] h-20 w-64" delay={30} duration={80} />

      {/* Animated flight path + plane (inspired by the brand mark) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <motion.path
          d="M-50 640 C 300 520, 520 660, 760 460 S 1180 180, 1520 240"
          stroke="url(#flight)"
          strokeWidth="2"
          strokeDasharray="3 10"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 3, delay: 1.8, ease: EASE }}
        />
        <defs>
          <linearGradient id="flight" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F36A2E" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F36A2E" />
            <stop offset="1" stopColor="#E6BD6C" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-10"
        initial={{ offsetDistance: '0%', opacity: 0 }}
        animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, delay: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        style={{
          offsetPath:
            "path('M-50 640 C 300 520, 520 660, 760 460 S 1180 180, 1520 240')",
          offsetRotate: 'auto',
        }}
      >
        <span className="grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow)]">
          <Plane size={20} className="rotate-45" />
        </span>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: contentY, opacity: fade }} className="relative z-20 flex h-full items-center">
        <motion.div variants={container} initial="hidden" animate="show" className="container-x w-full">
          <motion.div variants={rise}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
              <Star size={13} className="fill-gold-400 text-gold-400" />
              The soul of the Caucasus
            </span>
          </motion.div>

          <div className="mt-6 max-w-4xl">
            <h1 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-medium leading-[0.98] text-white">
              <motion.span variants={rise} className="block">
                Discover the
              </motion.span>
              <motion.span variants={rise} className="block">
                Beauty of <span className="text-gradient-brand italic">Georgia</span>
              </motion.span>
            </h1>
          </div>

          <motion.p variants={rise} className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">
            From glacier-crowned peaks to 8,000-year-old wine cellars — cinematic journeys
            through a land that welcomes you like family.
          </motion.p>

          <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-4">
            <Button to="/tours" size="lg">
              Book Your Journey
            </Button>
            <Button to="/destinations" size="lg" variant="glassDark">
              Explore Destinations
            </Button>
          </motion.div>

          <motion.div variants={rise} className="mt-12 flex items-center gap-6 text-white/70">
            <div className="flex -space-x-3">
              {['1544005313-94ddf0286df2', '1500648767791-00dcc994a43e', '1534528741775-53994a69daeb'].map((id) => (
                <img
                  key={id}
                  src={unsplash(id, { w: 120 })}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-white/80 object-cover"
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-gold-400" />
                ))}
              </div>
              <p className="text-white/70">Loved by 4,800+ travellers</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/50">Scroll</span>
        <span className="relative grid h-10 w-6 justify-center rounded-full border border-white/30 pt-2">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-white"
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  );
}
