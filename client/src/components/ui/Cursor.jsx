import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * Custom trailing cursor. Grows and inverts over interactive elements.
 * Hidden on touch / coarse pointers and when reduced motion is preferred.
 */
export default function Cursor() {
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return undefined;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target;
      setHovering(Boolean(t.closest('a, button, [data-cursor="hover"], input, textarea')));
    };
    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    document.body.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.body.removeEventListener('mouseleave', leave);
    };
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{
          width: hovering ? 56 : 14,
          height: hovering ? 56 : 14,
          x: hovering ? -28 : -7,
          y: hovering ? -28 : -7,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      />
    </motion.div>
  );
}
