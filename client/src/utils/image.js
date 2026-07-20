/**
 * Build an optimized Unsplash URL from a photo id.
 * @param {string} id  Unsplash photo id (the part after `photo-`)
 * @param {object} [opts]
 * @param {number} [opts.w=1600] target width
 * @param {number} [opts.q=80] quality
 * @returns {string}
 */
export function unsplash(id, { w = 1600, q = 80 } = {}) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/**
 * Deterministic reliable fallback image (never 404s).
 * @param {string} seed
 * @param {number} [w=1200]
 * @param {number} [h=800]
 */
export function fallbackImg(seed, w = 1200, h = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

/* ------------------------------------------------------------------ *
 * Responsive sizing
 *
 * Unsplash renders on demand from the `w` query param, so a card that is
 * 440 CSS px wide should never download the 1400px master the adapters
 * hand out. These helpers rewrite that param and build a `srcset` so the
 * browser picks the cheapest file for the slot and the device DPR.
 * ------------------------------------------------------------------ */

const RESIZABLE = /^https:\/\/images\.unsplash\.com\//;

/** Widths above this are pointless — Unsplash masters top out around here. */
const MAX_W = 2400;

/**
 * Rewrite the width (and optionally quality) of a resizable image URL.
 * Non-Unsplash URLs are returned untouched.
 * @param {string} url
 * @param {number} [w] target width in CSS px
 * @param {number} [q] JPEG quality
 */
export function resizeImage(url, w, q) {
  if (!url || !RESIZABLE.test(url)) return url;
  try {
    const u = new URL(url);
    if (w) u.searchParams.set('w', String(Math.min(Math.round(w), MAX_W)));
    if (q) u.searchParams.set('q', String(q));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * `srcset` with width descriptors for a slot `w` CSS px wide — 1x, 1.5x and
 * 2x candidates. Width descriptors (not `1x/2x`) are required for `sizes` to
 * have any effect, which is what lets one card serve phones and 4K alike.
 * @returns {string|undefined} undefined when the URL can't be resized
 */
export function imageSrcSet(url, w) {
  if (!url || !w || !RESIZABLE.test(url)) return undefined;
  const widths = [...new Set([w, Math.round(w * 1.5), w * 2].map((n) => Math.min(Math.round(n), MAX_W)))];
  return widths.map((n) => `${resizeImage(url, n)} ${n}w`).join(', ');
}

// URLs already requested this session — preloading the same image twice is
// free in the HTTP cache but still costs a decode and a JS object.
const preloaded = new Set();

const idle =
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (fn) => setTimeout(fn, 1);

/**
 * Warm the HTTP cache for images that are about to be shown (the next
 * pagination page, the next slide). Runs at idle priority so it never
 * competes with the images actually on screen.
 * @param {string[]} urls
 * @param {{w?: number}} [opts] same target width the component will request,
 *   so the preloaded file is the one the browser ends up using
 */
export function preloadImages(urls, { w } = {}) {
  if (typeof window === 'undefined') return;
  idle(() => {
    urls.filter(Boolean).forEach((url) => {
      const target = w ? resizeImage(url, w) : url;
      if (preloaded.has(target)) return;
      preloaded.add(target);
      const img = new Image();
      img.decoding = 'async';
      if ('fetchPriority' in img) img.fetchPriority = 'low';
      if (w) {
        img.sizes = `${Math.round(w)}px`;
        const set = imageSrcSet(url, w);
        if (set) img.srcset = set;
      }
      img.src = target;
    });
  });
}
