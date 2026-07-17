import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * Light/dark theme switch. `tone` matches the surrounding nav colour:
 * 'light' over the dark hero, 'dark' on a light bar.
 * @param {'light'|'dark'} [tone='dark']
 */
export default function ThemeToggle({ tone = 'dark', className }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-cursor="hover"
      className={cn(
        'relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border transition-colors',
        tone === 'light'
          ? 'border-white/25 text-white hover:border-brand-400 hover:text-brand-400'
          : 'border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-500',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          {isDark ? <Moon size={18} /> : <Sun size={19} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
