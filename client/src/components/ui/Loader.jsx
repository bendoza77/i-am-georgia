import { motion } from 'framer-motion';
import Logo from '../shared/Logo';

/**
 * Full-screen intro loader with the brand mark.
 */
export default function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[120] grid place-items-center bg-ink-950 text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Logo tone="light" className="scale-125" />
        </motion.div>

        <div className="h-px w-40 overflow-hidden bg-white/15">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-gold-400"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
