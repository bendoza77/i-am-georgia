import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import SmartImage from '../../components/ui/SmartImage';
import Badge from '../../components/ui/Badge';
import Reveal from '../../components/ui/Reveal';
import { BLOG_POSTS } from '../../constants/content';
import { unsplash } from '../../utils/image';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
const rest = BLOG_POSTS.filter((p) => p.id !== featured.id);

export default function Blog() {
  return (
    <>
      <PageHero
        eyebrow="The journal"
        title="Stories from Georgia"
        lead="Field notes, wine wisdom and travel dispatches from our guides and journey designers."
        image={unsplash('1565008447742-97f6f38c985c', { w: 2000 })}
      />

      {/* Featured article */}
      <Section className="bg-sand-50">
        <Reveal variant="up">
          <Link
            to="/blog"
            className="group grid overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-white shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] lg:grid-cols-2"
          >
            <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto">
              <SmartImage
                src={featured.image}
                alt={featured.title}
                fallbackSeed={featured.id}
                wrapperClassName="h-full w-full"
                className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <div className="absolute left-5 top-5">
                <Badge tone="solid">Featured</Badge>
              </div>
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex items-center gap-3 text-sm text-ink-500">
                <span className="font-semibold text-brand-600">{featured.category}</span>
                <span>·</span>
                <span>{featured.date}</span>
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 leading-relaxed text-ink-500">{featured.excerpt}</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-ink-500">By {featured.author}</span>
                <span className="inline-flex items-center gap-2 font-semibold text-brand-600">
                  Read story
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Grid */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((post) => (
            <motion.article key={post.id} variants={fadeUp}>
              <Link
                to="/blog"
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <SmartImage
                    src={post.image}
                    alt={post.title}
                    fallbackSeed={post.id}
                    wrapperClassName="h-full w-full"
                    className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                  />
                  <div className="absolute left-4 top-4">
                    <Badge tone="glass">{post.category}</Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl text-ink-900 transition-colors group-hover:text-brand-600">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-sm text-ink-500">
                    <span>{post.date}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} /> {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Section>
    </>
  );
}
