import { motion } from 'framer-motion';
import StatCounter from '../ui/StatCounter';
import { STATS } from '../../constants/site';
import { unsplash } from '../../utils/image';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

export default function Statistics() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0">
        <img
          src={unsplash('1454496522488-7a8e488e8606', { w: 2000, q: 75 })}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink-950/80" />
        <div className="noise-overlay absolute inset-0 opacity-[0.15]" />
      </div>

      <div className="container-x relative">
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center lg:text-left">
              <div className="font-display text-5xl text-white sm:text-6xl lg:text-7xl">
                <StatCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-3 h-px w-12 bg-brand-500 lg:mx-0 mx-auto" />
              <p className="mt-3 font-semibold text-white/90">{s.label}</p>
              <p className="mt-1 text-sm text-white/50">{s.hint}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
