import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/**
 * "I'm Georgia" brand lockup — a paper-plane/journey mark in brand orange
 * paired with a serif wordmark. Inspired by the orange-and-white brand,
 * not a reproduction of any external logo.
 * @param {'dark'|'light'} [tone='dark']
 */
export default function Logo({ tone = 'dark', className, markOnly = false }) {
  const wordColor = tone === 'light' ? 'text-white' : 'text-ink-900';
  const subColor = tone === 'light' ? 'text-white/60' : 'text-ink-400';

  return (
    <Link
      to="/"
      aria-label="I'm Georgia — home"
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-[var(--shadow-glow)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:rotate-[8deg]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden="true">
          <path
            d="M21.5 3.2 3.6 10.1c-1 .4-.95 1.85.08 2.16l6.02 1.8 1.8 6.02c.3 1.03 1.76 1.08 2.16.08L20.8 2.5"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M21.9 2.6c.28-.7-.44-1.42-1.14-1.14L2.9 8.6c-.78.3-.72 1.42.09 1.65l7.05 2 2 7.05c.23.8 1.35.87 1.65.09L21.9 2.6ZM10.4 11.9 6.1 10.7 18 6.1l-7.6 5.8Z"
            fill="currentColor"
          />
        </svg>
      </span>

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-xl tracking-tight', wordColor)}>
            I&rsquo;m <span className="text-gradient-brand font-semibold">Georgia</span>
          </span>
          <span className={cn('mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em]', subColor)}>
            Travel
          </span>
        </span>
      )}
    </Link>
  );
}
