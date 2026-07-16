import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-[var(--shadow-glow)] hover:bg-brand-600',
  solidDark:
    'bg-ink-900 text-white hover:bg-ink-800',
  outline:
    'border border-ink-200 text-ink-900 hover:border-brand-400 hover:text-brand-600 bg-transparent',
  ghost:
    'text-ink-800 hover:bg-ink-900/5',
  glass:
    'glass text-ink-900 hover:bg-white/80',
  glassDark:
    'glass-dark text-white hover:bg-white/10',
};

const SIZES = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-[0.95rem] gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
};

const base =
  'group relative inline-flex select-none items-center justify-center rounded-full font-semibold tracking-tight ' +
  'transition-[background,color,border,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] ' +
  'will-change-transform disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2';

const MotionLink = motion(Link);

/**
 * Universal Button. Renders <Link>, <a> or <button> based on props.
 * Supports Framer Motion tap/hover via `motion.*` under the hood.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, className, children, animated = true, ...props },
  ref,
) {
  const classes = cn(base, VARIANTS[variant], SIZES[size], className);
  const motionProps = animated
    ? { whileHover: { y: -2 }, whileTap: { scale: 0.97 }, transition: { duration: 0.25 } }
    : {};

  const content = <span className="relative z-10 inline-flex items-center gap-[inherit]">{children}</span>;

  if (to) {
    return (
      <MotionLink ref={ref} to={to} className={classes} {...motionProps} {...props}>
        {content}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a ref={ref} href={href} className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} className={classes} {...motionProps} {...props}>
      {content}
    </motion.button>
  );
});

export default Button;
