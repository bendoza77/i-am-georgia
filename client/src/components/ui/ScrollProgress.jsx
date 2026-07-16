import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin brand progress bar pinned to the top of the viewport.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-brand-500 via-brand-400 to-gold-500"
      aria-hidden="true"
    />
  );
}
