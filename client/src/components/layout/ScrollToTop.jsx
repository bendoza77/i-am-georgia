import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on route change (skips in-page hash links).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
