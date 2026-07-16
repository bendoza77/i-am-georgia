/**
 * Shared Framer Motion variants & transitions.
 * Kept transform/opacity-only for GPU-accelerated 60fps motion.
 */

export const EASE = [0.16, 1, 0.3, 1];
export const EASE_SOFT = [0.65, 0, 0.35, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } },
};

export const slideLeft = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
};

export const slideRight = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Parent container that staggers its children. */
export const staggerContainer = (stagger = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Word/line reveal used by AnimatedText. */
export const wordReveal = {
  hidden: { opacity: 0, y: '100%' },
  show: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Default viewport config for whileInView. */
export const viewportOnce = { once: true, amount: 0.25, margin: '0px 0px -10% 0px' };

/** Page transition wrapper. */
export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.35, ease: EASE_SOFT } },
};
