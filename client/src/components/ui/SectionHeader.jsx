import { cn } from '../../utils/cn';
import AnimatedText from './AnimatedText';
import Reveal from './Reveal';

/**
 * Consistent section heading: eyebrow + animated title + optional lead.
 */
export default function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'dark',
  className,
  titleClassName,
}) {
  const centered = align === 'center';
  const isLight = tone === 'light';

  return (
    <div
      className={cn(
        'max-w-2xl',
        centered && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <Reveal variant="fade">
          <span
            className={cn(
              'mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]',
              isLight ? 'text-gold-400' : 'text-brand-600',
            )}
          >
            <span className={cn('h-px w-8', isLight ? 'bg-gold-400/60' : 'bg-brand-500/50')} />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <AnimatedText
        text={title}
        as="h2"
        className={cn(
          'text-4xl leading-[1.02] sm:text-5xl lg:text-[3.4rem]',
          centered && 'justify-center',
          isLight ? 'text-white' : 'text-ink-900',
          titleClassName,
        )}
      />

      {lead && (
        <Reveal variant="up" delay={0.15}>
          <p
            className={cn(
              'mt-6 text-lg leading-relaxed text-pretty',
              isLight ? 'text-white/70' : 'text-ink-500',
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
