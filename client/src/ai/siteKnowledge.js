import { NAV_LINKS } from '../constants/navigation';
import { SITE } from '../constants/site';

/**
 * Structured, hand-authored knowledge of the "I'm Georgia" website: routes,
 * what lives on each page, where the key buttons are, and how to complete
 * common tasks. This is the single source of truth the AI concierge reads —
 * keep it accurate when the UI changes.
 *
 * It is intentionally written in plain language (not code) because it becomes
 * part of the model's system prompt.
 */

/** Every public route and how to reach it. */
export const ROUTES = [
  {
    path: '/',
    name: 'Home',
    summary:
      'Landing page. Top-to-bottom: a full-screen hero, "Popular destinations" (a grid of featured regions), Experiences, Why Georgia, Featured Tours, Statistics, a Map preview, Testimonials, a photo gallery preview ("A country worth framing"), Partners, an FAQ and a closing call-to-action.',
  },
  {
    path: '/destinations',
    name: 'Destinations',
    summary:
      'Browse all Georgian regions/destinations as a filterable grid. Filter pills at the top switch categories (Mountains, Cities, Wine Country, Coast, Ancient).',
  },
  {
    path: '/tours',
    name: 'Tours & Packages',
    summary:
      'All multi-day tours as cards. Filter pills at the top narrow by category. Each card shows price "from", rating, duration, difficulty, season and group size, with a "View journey" button.',
  },
  {
    path: '/hotels',
    name: 'Hotels & Stays',
    summary:
      'Curated hotels. Top: a stats strip, then a large "Featured stay" spotlight. Below, a collection with a "Sort by" dropdown (Recommended, Price low→high, Price high→low, Top rated, Most stars) and city filter pills. Each hotel card shows the star class, guest rating, nightly price, amenity icons and a "View hotel" button. Sold-out hotels show a "Fully booked" overlay.',
  },
  {
    path: '/gallery',
    name: 'Gallery',
    summary: 'Photo gallery of Georgia in a masonry/bento grid; click an image to open it larger.',
  },
  {
    path: '/about',
    name: 'About',
    summary: 'The company story, team and values. Anchors: #story and #team.',
  },
  { path: '/blog', name: 'Blog / Journal', summary: 'Travel articles and journal entries.' },
  {
    path: '/contact',
    name: 'Contact',
    summary:
      'Contact form, company details and a map. Anchors: #faq for travel FAQ. Use this page to send an enquiry or booking request.',
  },
];

/** Where the recurring, always-on-screen controls live. */
export const UI_LANDMARKS = [
  {
    element: 'Navigation bar (Navbar)',
    location: 'Fixed at the very top of every page. It turns to a light "glass" bar once you scroll down.',
    contains:
      'Logo on the left (click it to return Home). Center: links — ' +
      NAV_LINKS.map((l) => l.label).join(', ') +
      '. Right: a clickable phone number and a solid "Book Now" button that goes to the Tours page.',
  },
  {
    element: '"Book Now" button',
    location: 'Top-right corner of the navigation bar, on desktop.',
    contains: 'Takes the visitor to the Tours & Packages page (/tours).',
  },
  {
    element: 'Mobile menu',
    location:
      'On phones/tablets the nav links are hidden behind a hamburger icon (three lines) in the top-right. Tap it to open a full-screen menu with every link.',
    contains: 'All navigation links plus contact details.',
  },
  {
    element: 'Filter pills',
    location: 'Near the top of the Destinations, Tours and Hotels pages.',
    contains: 'Rounded buttons that filter the grid; the active one is highlighted dark.',
  },
  {
    element: 'Sort dropdown',
    location: 'Top-right of the "collection" area on the Hotels page.',
    contains: 'Changes the order of the hotel cards.',
  },
  {
    element: 'Back-to-top button',
    location: 'Appears in the bottom-right corner after you scroll down.',
    contains: 'Smoothly scrolls the page back to the top.',
  },
  {
    element: 'Ask Nino concierge button',
    location: 'A pill button fixed in the bottom-right corner of every public page.',
    contains: 'Opens this AI concierge chat.',
  },
  {
    element: 'Footer',
    location: 'Bottom of every page.',
    contains: 'Grouped links (Explore, Company, Support), contact info and social links.',
  },
];

/** Step-by-step recipes for the things visitors most often want to do. */
export const HOW_TO = [
  {
    task: 'Book a tour',
    steps:
      'Open Tours (top nav "Tours" or the "Book Now" button top-right) → use the filter pills to narrow by category → open a tour with "View journey" → to confirm, head to Contact and send a booking request, or call the phone number in the navbar.',
  },
  {
    task: 'Find a hotel / place to stay',
    steps:
      'Open Hotels in the top nav → filter by city with the pills and reorder with the "Sort by" dropdown → each card shows price per night, star class, guest rating and amenities.',
  },
  {
    task: 'Explore destinations',
    steps:
      'Open Destinations in the top nav, or on the Home page look at the "Popular destinations" section.',
  },
  {
    task: 'Contact the team or get a custom itinerary',
    steps:
      'Open Contact in the top nav → fill in the form, or call the phone number / email shown in the navbar and footer.',
  },
  {
    task: 'See photos',
    steps: 'Open Gallery in the top nav, or use the "A country worth framing" section on the Home page.',
  },
];

/** Facts the concierge can quote directly. */
export const SITE_FACTS = {
  name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  phone: SITE.phone,
  email: SITE.email,
  address: SITE.address,
  hours: SITE.hours,
};
