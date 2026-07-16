import Marquee from '../ui/Marquee';
import { PARTNERS } from '../../constants/site';

export default function Partners() {
  return (
    <section className="border-y border-ink-100 bg-sand-50 py-12">
      <div className="container-x mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
          Trusted by Georgia&rsquo;s finest hosts & partners
        </p>
      </div>
      <Marquee speed="38s">
        {PARTNERS.map((name) => (
          <span
            key={name}
            className="font-display text-2xl text-ink-300 transition-colors duration-300 hover:text-brand-500 sm:text-3xl"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
