import { lazy } from 'react';

const RELOAD_FLAG = 'ig-chunk-reloaded';

/**
 * Like React.lazy, but resilient to stale deploys.
 *
 * After a new deployment Vercel serves fresh, differently-hashed chunks and
 * removes the old ones. A tab opened before the deploy will 404 when it tries
 * to import a route chunk by its old name. We catch that failure and do exactly
 * one full-page reload to pull the new HTML + chunks; a sessionStorage flag
 * prevents an infinite reload loop if the failure is something else.
 */
export function lazyWithReload(factory) {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // Suspend indefinitely while the page reloads.
        return new Promise(() => {});
      }
      // Already retried once — let the error boundary handle it.
      throw err;
    }
  });
}
