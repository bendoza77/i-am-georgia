import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { wordReveal, staggerContainer, viewportOnce } from '../../animations/variants';

/**
 * Word-by-word mask reveal for headings.
 * Each word rises from behind a clipping mask with a stagger.
 */
export default function AnimatedText({
  text,
  as = 'h2',
  className,
  wordClassName,
  stagger = 0.06,
  delay = 0,
  once = true,
}) {
  const MotionTag = motion[as] ?? motion.h2;
  const words = String(text).split(' ');

  return (
    <MotionTag
      className={cn('flex flex-wrap', className)}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={once ? viewportOnce : { amount: 0.3 }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden pb-[0.12em] pr-[0.28em]" aria-hidden="true">
          <motion.span variants={wordReveal} className={cn('inline-block will-change-transform', wordClassName)}>
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
