import { unsplash } from '../utils/image';

/* ---------------- Why Georgia ---------------- */
export const WHY_GEORGIA = [
  {
    icon: 'compass',
    title: 'Local experts, on the ground',
    text: 'Every itinerary is built and led by Georgians who grew up in these valleys and mountains.',
  },
  {
    icon: 'route',
    title: 'Journeys, not checklists',
    text: 'We design slow, cinematic routes with room to breathe, wander and be surprised.',
  },
  {
    icon: 'heart-handshake',
    title: 'Legendary hospitality',
    text: 'You travel as a guest, not a tourist — welcomed to real tables in real homes.',
  },
  {
    icon: 'shield-check',
    title: 'Cared for, end to end',
    text: 'Vetted stays, licensed guides and 24/7 support from arrival to farewell.',
  },
];

/* ---------------- Testimonials ---------------- */
export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Elena Marchetti',
    country: 'Italy',
    avatar: unsplash('1544005313-94ddf0286df2', { w: 200 }),
    text: 'The most soulful trip of my life. Svaneti felt like stepping into a legend, and our guide made every meal feel like family.',
    tour: 'Great Caucasus Crossing',
    rating: 5,
  },
  {
    id: 't2',
    name: 'James Whitfield',
    country: 'United Kingdom',
    avatar: unsplash('1500648767791-00dcc994a43e', { w: 200 }),
    text: 'I came for the wine and left with lifelong friends. The qvevri cellars in Kakheti were unforgettable and flawlessly organised.',
    tour: 'The Soul of Georgian Wine',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Aiko Tanaka',
    country: 'Japan',
    avatar: unsplash('1534528741775-53994a69daeb', { w: 200 }),
    text: 'Tbilisi by day, mountains by dawn. Beautifully paced and endlessly thoughtful — the details were pure luxury.',
    tour: 'Tbilisi & Ancient Mtskheta',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Noah Bergström',
    country: 'Sweden',
    avatar: unsplash('1507003211169-0a1dd7228f2d', { w: 200 }),
    text: 'Powder days at Gudauri with no crowds and expert guides. I’ve skied everywhere — this was something else entirely.',
    tour: 'Gudauri Freeride Week',
    rating: 5,
  },
];

/* ---------------- FAQ ---------------- */
export const FAQS = [
  {
    q: 'When is the best time to visit Georgia?',
    a: 'Georgia is a year-round destination. May–June and September–October offer mild weather and golden light; July–August are perfect for high-mountain trekking; December–March bring world-class powder to Gudauri and Bakuriani.',
  },
  {
    q: 'Do I need a visa to travel to Georgia?',
    a: 'Citizens of 90+ countries can enter visa-free for up to one year. We confirm your specific requirements during booking and handle all the paperwork guidance for you.',
  },
  {
    q: 'Are your tours private or in groups?',
    a: 'Both. Every itinerary can be run as an intimate private journey or as a small-group departure of up to 12 travellers. You choose the rhythm that suits you.',
  },
  {
    q: 'Is Georgia a safe place to travel?',
    a: 'Yes. Georgia is consistently ranked among the safest countries in the region, with famously warm hospitality. Our licensed guides and 24/7 support are with you throughout.',
  },
  {
    q: 'Can you tailor a trip to my interests?',
    a: 'Absolutely — bespoke design is our specialty. Wine, photography, hiking, family, honeymoon or slow luxury: tell us your dream and we compose it around you.',
  },
];

/* ---------------- About: values, timeline, team ---------------- */
export const VALUES = [
  { icon: 'sparkles', title: 'Authenticity', text: 'Real places, real people, no staged experiences.' },
  { icon: 'leaf', title: 'Responsibility', text: 'Travel that gives back to local communities and land.' },
  { icon: 'gem', title: 'Craft', text: 'Obsessive attention to the details that make a journey sing.' },
  { icon: 'users', title: 'Warmth', text: 'We treat every traveller the way Georgians treat a guest.' },
];

export const TIMELINE = [
  { year: '2013', title: 'A table and a dream', text: 'Two friends start guiding travellers to their home villages in Kakheti and Svaneti.' },
  { year: '2016', title: 'The first tower stay', text: 'We restore a medieval Svan tower into a boutique base for mountain journeys.' },
  { year: '2019', title: '1,000 guests', text: 'Word of mouth carries us across 30 countries; our guide family grows to 24.' },
  { year: '2022', title: 'A new studio', text: 'We open our Tbilisi design studio to craft fully bespoke, cinematic itineraries.' },
  { year: '2025', title: 'Today', text: '120+ curated journeys, 4,800+ travellers, and the same table we started at.' },
];

export const TEAM = [
  { name: 'Nino Kapanadze', role: 'Founder & Journey Designer', image: unsplash('1573496359142-b8d87734a5a2', { w: 500 }) },
  { name: 'Giorgi Beridze', role: 'Head of Mountain Guiding', image: unsplash('1500648767791-00dcc994a43e', { w: 500 }) },
  { name: 'Ana Tsereteli', role: 'Wine & Culture Lead', image: unsplash('1494790108377-be9c29b29330', { w: 500 }) },
  { name: 'Luka Dvali', role: 'Guest Experience', image: unsplash('1506794778202-cad84cf45f1d', { w: 500 }) },
];

/* ---------------- Blog ---------------- */
export const BLOG_POSTS = [
  {
    id: 'wine-8000-years',
    title: '8,000 Years in a Clay Vessel: How Georgia Invented Wine',
    excerpt: 'Deep beneath Kakheti’s vineyards, buried qvevri quietly ferment a tradition older than history itself.',
    category: 'Wine & Food',
    date: 'June 28, 2025',
    readTime: '6 min',
    image: unsplash('1510812431401-41d2bd2722f3'),
    author: 'Ana Tsereteli',
    featured: true,
  },
  {
    id: 'svaneti-towers',
    title: 'The Towers of Svaneti: A Thousand Years of Standing Guard',
    excerpt: 'In Georgia’s highest villages, stone towers still watch over families as they have for a millennium.',
    category: 'Culture',
    date: 'June 14, 2025',
    readTime: '8 min',
    image: unsplash('1508739773434-c26b3d09e071'),
    author: 'Giorgi Beridze',
  },
  {
    id: 'tbilisi-48-hours',
    title: '48 Hours in Tbilisi: Baths, Balconies and Wine Bars',
    excerpt: 'A perfect weekend in a city where sulphur steam, old-world balconies and a new creative wave collide.',
    category: 'City Guide',
    date: 'May 30, 2025',
    readTime: '5 min',
    image: unsplash('1565008447742-97f6f38c985c'),
    author: 'Nino Kapanadze',
  },
  {
    id: 'kazbegi-road',
    title: 'The Georgian Military Highway: The Greatest Drive in the Caucasus',
    excerpt: 'Fortresses, mineral springs and a lonely church at 2,170m along the road to Kazbegi.',
    category: 'Adventure',
    date: 'May 12, 2025',
    readTime: '7 min',
    image: unsplash('1589308078059-be1415eab4c3'),
    author: 'Luka Dvali',
  },
  {
    id: 'georgian-feast',
    title: 'The Supra: Understanding the Georgian Feast',
    excerpt: 'More than a meal — an ancient ritual of toasts, poetry and belonging led by the tamada.',
    category: 'Wine & Food',
    date: 'April 26, 2025',
    readTime: '6 min',
    image: unsplash('1504674900247-0877df9cc836'),
    author: 'Ana Tsereteli',
  },
  {
    id: 'gudauri-powder',
    title: 'Chasing Powder: A Freeride Season in Gudauri',
    excerpt: 'Why in-the-know skiers are quietly swapping the Alps for the empty bowls of the Caucasus.',
    category: 'Adventure',
    date: 'March 18, 2025',
    readTime: '5 min',
    image: unsplash('1551524559-8af4e6624178'),
    author: 'Giorgi Beridze',
  },
];

/* ---------------- Gallery ---------------- */
export const GALLERY_CATEGORIES = ['All', 'Mountains', 'Cities', 'Wine', 'People', 'Nature'];

export const GALLERY = [
  { id: 'g1', category: 'Mountains', span: 'tall', image: unsplash('1508739773434-c26b3d09e071'), caption: 'Ushguli, Svaneti' },
  { id: 'g2', category: 'Cities', span: 'wide', image: unsplash('1565008447742-97f6f38c985c'), caption: 'Old Tbilisi' },
  { id: 'g3', category: 'Wine', span: 'normal', image: unsplash('1510812431401-41d2bd2722f3'), caption: 'Qvevri cellar, Kakheti' },
  { id: 'g4', category: 'Nature', span: 'normal', image: unsplash('1441974231531-c6227db76b6e'), caption: 'Caucasus forest' },
  { id: 'g5', category: 'Mountains', span: 'wide', image: unsplash('1589308078059-be1415eab4c3'), caption: 'Gergeti Trinity' },
  { id: 'g6', category: 'People', span: 'tall', image: unsplash('1524594152303-9fd13543fe6e'), caption: 'A supra toast' },
  { id: 'g7', category: 'Nature', span: 'normal', image: unsplash('1454496522488-7a8e488e8606'), caption: 'Alpine lake' },
  { id: 'g8', category: 'Cities', span: 'normal', image: unsplash('1533105079780-92b9be482077'), caption: 'Batumi seafront' },
  { id: 'g9', category: 'Wine', span: 'tall', image: unsplash('1506377247377-2a5b3b417ebb'), caption: 'Alazani vineyards' },
  { id: 'g10', category: 'Mountains', span: 'normal', image: unsplash('1551524559-8af4e6624178'), caption: 'Gudauri ridgeline' },
  { id: 'g11', category: 'People', span: 'wide', image: unsplash('1504674900247-0877df9cc836'), caption: 'Georgian table' },
  { id: 'g12', category: 'Nature', span: 'normal', image: unsplash('1433086966358-54859d0ed716'), caption: 'Hidden waterfall' },
];
