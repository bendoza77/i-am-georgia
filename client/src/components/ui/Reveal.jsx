import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from '../../animations/variants';

const PRESETS = {
  up: fadeUp,
  fade: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } },
  left: { hidden: { opacity: 0, x: 48 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } },
  right: { hidden: { opacity: 0, x: -48 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } },
};

/**
 * Reveal children on scroll into view.
 * @param {'up'|'fade'|'scale'|'left'|'right'} [variant='up']
 */
export default function Reveal({ children, variant = 'up', delay = 0, as = 'div', className, ...props }) {
  const MotionTag = motion[as] ?? motion.div;
  const preset = PRESETS[variant] ?? fadeUp;

  return (
    <MotionTag
      className={className}
      variants={preset}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
