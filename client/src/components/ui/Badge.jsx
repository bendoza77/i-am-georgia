import { cn } from '../../utils/cn';

const TONES = {
  brand: 'bg-brand-500/12 text-brand-700 ring-brand-500/20',
  gold: 'bg-gold-500/15 text-gold-600 ring-gold-500/25',
  ink: 'bg-ink-900/8 text-ink-800 ring-ink-900/10',
  glass: 'glass text-ink-900 ring-white/40',
  solid: 'bg-brand-500 text-white ring-transparent',
};

/**
 * Small pill label / tag.
 */
export default function Badge({ tone = 'brand', className, children, icon, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ring-inset',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
