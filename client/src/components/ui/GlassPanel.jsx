import { cn } from '../../utils/cn';

/**
 * Frosted glass surface for stats, cards and overlays.
 */
export default function GlassPanel({ dark = false, className, children, ...props }) {
  return (
    <div
      className={cn(
        dark ? 'glass-dark' : 'glass',
        'rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
