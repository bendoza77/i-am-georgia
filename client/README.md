# I'm Georgia — Premium Travel Website

A cinematic, award-worthy front-end for **I'm Georgia**, a travel company inviting the world to
discover the mountains, wine valleys, ancient cities and warm hospitality of Georgia.

Built as a modular, production-ready React front-end. **No backend / API / business logic** — this is
pure UI, UX, motion and design-system architecture.

## Tech Stack

- **React 19** + **Vite 8** (JavaScript, no TypeScript)
- **Tailwind CSS v4** (design tokens via `@theme` in `src/index.css`)
- **Framer Motion** — reveals, page transitions, carousels, parallax
- **GSAP** + **Lenis** — smooth scrolling
- **React Router** — routing with lazy-loaded pages
- **lucide-react** / **react-icons** — iconography
- **clsx** + **tailwind-merge** — the `cn()` class utility

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

## Architecture

```
src/
├── animations/        # shared Framer Motion variants & easing tokens
├── assets/            # local static assets
├── components/
│   ├── ui/            # design system: Button, Badge, Section, Reveal,
│   │                  #   AnimatedText, SectionHeader, GlassPanel, Accordion,
│   │                  #   Field, FilterPills, StatCounter, Marquee, Cursor,
│   │                  #   ScrollProgress, BackToTop, Loader, SmartImage, Icon
│   ├── layout/        # Navbar, MobileMenu, Footer, Layout, ScrollToTop
│   ├── sections/      # Home sections (Hero, Experiences, Statistics, …)
│   └── shared/        # Logo, PageHero, DestinationCard, TourCard
├── constants/         # all site content (data-driven, no duplicated markup)
├── hooks/             # useLenis, useScrolled, useLockBody, useMagnetic, useMediaQuery
├── pages/             # Home, Destinations, Tours, Gallery, About, Blog, Contact, NotFound
├── routes/            # AppRoutes (lazy loading + code splitting)
├── utils/             # cn(), image helpers
├── App.jsx
└── main.jsx
```

## Design System

Brand tokens live in `src/index.css` under `@theme`:

- **Primary** orange `#F36A2E` (`brand-*`) · **Accent** warm gold (`gold-*`)
- **Charcoal** (`ink-*`) · **Cream neutrals** (`sand-*`)
- Radius, shadow/elevation, easing and animation tokens
- Fonts: **Fraunces** (display) + **Manrope** (body)

Helper utilities: `.container-x`, `.glass`, `.glass-dark`, `.text-gradient-brand`, `.skeleton`,
`.mask-fade-r`, plus full `prefers-reduced-motion` support.

## Accessibility & Performance

- Semantic HTML, ARIA labels, keyboard-navigable menus/lightbox, visible focus rings
- Reduced-motion aware (Lenis, cursor and animations disable gracefully)
- Lazy-loaded routes, lazy images with shimmer + blur-up + graceful fallback
- Transform/opacity-only animations for GPU-accelerated 60fps motion

> Imagery is loaded from Unsplash for demonstration and falls back gracefully if offline.
