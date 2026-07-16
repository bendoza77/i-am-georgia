import { ROUTES } from './siteKnowledge';

const PATHS = ROUTES.map((r) => r.path);

/** OpenAI/Groq-style tool the concierge uses to move the visitor around the site. */
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigateTo',
      description:
        'Navigate the visitor to a page on this website. Call this only when the user clearly wants to go to or view a page.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            enum: PATHS,
            description: 'The route to open, e.g. "/hotels".',
          },
          reason: {
            type: 'string',
            description: 'A short, friendly reason shown to the user, e.g. "so you can browse our stays".',
          },
        },
        required: ['path'],
      },
    },
  },
];

export const VALID_PATHS = new Set(PATHS);
