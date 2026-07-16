import { useEffect } from 'react';

/**
 * Locks body scroll while `locked` is true (used by MobileMenu / Modal).
 * Also pauses Lenis if present.
 * @param {boolean} locked
 */
export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop?.();

    return () => {
      document.body.style.overflow = overflow;
      window.__lenis?.start?.();
    };
  }, [locked]);
}
