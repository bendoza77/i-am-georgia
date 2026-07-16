import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import { unsplash } from '../utils/image';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-ink-950 text-center text-white">
      <div className="absolute inset-0">
        <img src={unsplash('1470071459604-3b5ec3a7fe05', { w: 2000, q: 70 })} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 to-ink-950" />
      </div>

      <div className="container-x relative">
        <motion.div
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-[var(--shadow-glow)]"
        >
          <Compass size={30} />
        </motion.div>
        <p className="font-display text-[7rem] leading-none text-white/90 sm:text-[10rem]">404</p>
        <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">This trail leads nowhere</h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">
          The page you&rsquo;re looking for has wandered off the map. Let&rsquo;s get you back to
          somewhere beautiful.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button to="/" size="lg">
            Back to home
          </Button>
          <Button to="/destinations" size="lg" variant="glassDark">
            Explore destinations
          </Button>
        </div>
      </div>
    </section>
  );
}
