import { useRef } from 'react';

/**
 * Magnetic hover effect — element is gently pulled toward the cursor.
 * Returns a ref plus pointer handlers to spread onto the element.
 * @param {number} [strength=0.35]
 */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0px, 0px)';
  };

  return { ref, onMouseMove, onMouseLeave };
}
