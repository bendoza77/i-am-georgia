import { useState } from 'react';
import { cn } from '../../utils/cn';
import { fallbackImg } from '../../utils/image';

/**
 * Lazy, responsive image with a shimmer skeleton, blur-up fade,
 * and a graceful fallback so the layout never shows a broken image.
 */
export default function SmartImage({
  src,
  alt = '',
  className,
  wrapperClassName,
  fallbackSeed,
  loading = 'lazy',
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const finalSrc = errored ? fallbackImg(fallbackSeed || alt || 'georgia') : src;

  return (
    <span className={cn('relative block overflow-hidden bg-sand-200', wrapperClassName)}>
      {!loaded && <span className="skeleton absolute inset-0" aria-hidden="true" />}
      <img
        src={finalSrc}
        alt={alt}
        loading={loading}
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
