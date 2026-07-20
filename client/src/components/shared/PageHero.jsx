import { motion, useScroll, useTransform } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AnimatedText from '../ui/AnimatedText';
import Reveal from '../ui/Reveal';
import { resizeImage } from '../../utils/image';

// The hero is the LCP element on every inner page, and it is always full
// bleed — so the only thing that decides the right file is the viewport.
const HERO_WIDTHS = [640, 960, 1280, 1600, 2000];

/**
 * Shared inner-page hero with parallax image, breadcrumb and animated title.
 */
export default function PageHero({ eyebrow, title, lead, image, crumb }) {
  const ref = useRef(null);
  const srcSet = useMemo(() => {
    // resizeImage is a no-op for URLs it can't rewrite — emitting identical
    // candidates would just mislead the browser, so fall back to plain `src`.
    if (!image || resizeImage(image, 640) === image) return undefined;
    return HERO_WIDTHS.map((w) => `${resizeImage(image, w)} ${w}w`).join(', ');
  }, [image]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  return (
    <section ref={ref} className="relative flex h-[64vh] min-h-[440px] items-end overflow-hidden bg-ink-950">
      <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
        <img
          src={image}
          srcSet={srcSet}
          sizes={srcSet ? '100vw' : undefined}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/60" />
      </motion.div>

      <div className="container-x relative z-10 pb-16 lg:pb-20">
        <Reveal variant="fade">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-brand-400">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/90">{crumb ?? title}</span>
          </nav>
        </Reveal>

        {eyebrow && (
          <Reveal variant="fade">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
              <span className="h-px w-8 bg-gold-400/60" />
              {eyebrow}
            </span>
          </Reveal>
        )}

        <AnimatedText
          text={title}
          as="h1"
          className="max-w-4xl font-display text-5xl text-white sm:text-6xl lg:text-7xl"
        />

        {lead && (
          <Reveal variant="up" delay={0.15}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">{lead}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
