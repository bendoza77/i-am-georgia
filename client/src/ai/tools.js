import { ROUTES } from './siteKnowledge';

const PATHS = ROUTES.map((r) => r.path);

/*
 * Optional parameters are described as "omit …", never "leave empty".
 *
 * The provider validates generated arguments against these schemas before it
 * streams anything, and an explicit `{"maxPricePerNight": null}` fails a
 * `{type:"number"}` check — which kills the whole reply. Union types
 * (`["number","null"]`) are worse: they break tool generation outright on this
 * model. Wording the descriptions so the model omits unused keys is what
 * works, and `streamConcierge` falls back to a tool-free answer if a tool call
 * still fails to generate.
 */
const optional = (type, description) => ({ type, description: `${description} Omit if not relevant.` });

/** OpenAI/Groq-style tools the concierge uses to act on the site. */
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigateTo',
      description:
        'Navigate the visitor to a fixed page on this website. Call this only when the user clearly wants to go to or view a page. For a specific hotel use openHotel instead.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            enum: PATHS,
            description: 'The route to open, e.g. "/hotels".',
          },
          reason: optional(
            'string',
            'A short, friendly reason shown to the user, e.g. "so you can browse our stays".',
          ),
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'findHotels',
      description:
        'Search the live hotel collection by name, room type, guest type or nightly budget. Use this whenever the visitor asks about hotels, prices, rooms or availability — never invent a hotel, a price or a room type.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'What the visitor is looking for, e.g. "Citrus", "boutique", "family room", "triple". Use an empty string to list the collection by price instead.',
          },
          maxPricePerNight: optional(
            'number',
            'Only hotels whose cheapest nightly rate is at or below this amount.',
          ),
          minPricePerNight: optional(
            'number',
            'Only hotels whose cheapest nightly rate is at or above this amount.',
          ),
        },
        // `query` is required on purpose: a tool whose arguments are all
        // optional makes this model produce malformed calls.
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'openHotel',
      description:
        "Take the visitor to a specific hotel's page. Use it as soon as they show interest in one hotel (\"tell me about Citrus\", \"show me that one\", \"book it\"). Set startBooking to true when they want to book, which opens the booking flow directly.",
      parameters: {
        type: 'object',
        properties: {
          hotelId: {
            type: 'string',
            description: 'The hotel id from the catalogue or from findHotels. A hotel name also works.',
          },
          startBooking: optional(
            'boolean',
            'True to open the booking flow (dates, rooms, guests) rather than the hotel page.',
          ),
          reason: optional('string', 'A short, friendly reason shown to the user.'),
        },
        required: ['hotelId'],
      },
    },
  },
];

export const VALID_PATHS = new Set(PATHS);
