import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Animated number that counts up when scrolled into view.
 */
export default function StatCounter({ value, suffix = '', duration = 1800, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(ease(p) * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
