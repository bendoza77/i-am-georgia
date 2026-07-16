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
