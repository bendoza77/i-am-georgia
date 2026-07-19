import { unsplash } from './image';

// Hotels without photos get a consistent set of real hotel images from this
// pool. The choice is deterministic (based on the hotel id), so the same hotel
// always shows the same pictures.
const POOL = [
  '1566073771259-6a8506099945', // hotel exterior
  '1520250497591-112f2f40a3f4', // lobby
  '1542314831-068cd1dbfeeb', // mountain resort
  '1571896349842-33c89424de2d', // suite
  '1618773928121-c32242e63f39', // room
  '1582719508461-905c673771fd', // seafront hotel
  '1445019980597-93fa8acb246c', // pool
  '1611892440504-42a792e24d32', // bedroom
  '1590490360182-c33d57733427', // interior
  '1551882547-ff40c63fe5fa', // resort
  '1611048267451-e6ed903d4a38', // bathroom
  '1578683010236-d716f9a3f461', // king room
  '1584132967334-10e028bd69f7', // reception
  '1631049307264-da0ec9d70304', // modern room
  '1522798514-97ceb8c4f1c8', // dining
  '1540541338287-41700207dee6', // boutique
];

// Simple, stable string hash -> non-negative integer.
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Returns `count` image URLs for a hotel, always the same for a given seed.
 * @param {string} seed   the hotel id
 * @param {number} count  how many images
 * @param {object} [opts] passed to unsplash() (e.g. { w: 2000 })
 */
export function hotelImages(seed, count = 5, opts) {
  const start = hash(String(seed)) % POOL.length;
  return Array.from({ length: count }, (_, i) => unsplash(POOL[(start + i) % POOL.length], opts));
}
