import { useCallback, useState } from 'react';
import { cn } from '../../utils/cn';
import { fallbackImg, imageSrcSet, resizeImage } from '../../utils/image';

/**
 * Lazy, responsive image with a shimmer skeleton, blur-up fade,
 * and a graceful fallback so the layout never shows a broken image.
 *
 * @param {number} [w] width of the slot in CSS px. Rewrites the Unsplash `w`
 *   param and emits a 1x/1.5x/2x `srcset` — always pass it for card-sized
 *   slots, otherwise a 1400px master is downloaded for a 440px card.
 * @param {string} [sizes] media-condition sizes hint; defaults to `${w}px`.
 * @param {boolean} [priority] above-the-fold image: eager + high fetchpriority.
 */
export default function SmartImage({
  src,
  alt = '',
  className,
  wrapperClassName,
  fallbackSeed,
  loading,
  w,
  sizes,
  priority = false,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [seen, setSeen] = useState(src);

  // Reset during render (not in an effect) when the source changes, so a
  // recycled card never shows the previous hotel's photo for a frame.
  if (seen !== src) {
    setSeen(src);
    setLoaded(false);
    setErrored(false);
  }

  const rawSrc = errored ? fallbackImg(fallbackSeed || alt || 'georgia') : src;
  const finalSrc = w ? resizeImage(rawSrc, w) : rawSrc;
  const srcSet = w ? imageSrcSet(rawSrc, w) : undefined;

  // Ref callbacks run in the commit phase, before paint. Marking an image the
  // browser already has as loaded there means paginating back to a visited
  // page shows the photo immediately instead of flashing the skeleton.
  const imgRef = useCallback(
    (node) => {
      if (node?.complete && node.naturalWidth > 0) setLoaded(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finalSrc],
  );

  return (
    <span className={cn('relative block overflow-hidden bg-sand-200', wrapperClassName)}>
      {!loaded && <span className="skeleton absolute inset-0" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={finalSrc}
        srcSet={srcSet}
        sizes={srcSet ? (sizes ?? `${Math.round(w)}px`) : undefined}
        alt={alt}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) setErrored(true);
          else setLoaded(true);
        }}
        className={cn(
          'h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out-expo)]',
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105',
          className,
        )}
        {...props}
      />
    </span>
  );
}
