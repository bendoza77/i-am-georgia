import Groq from 'groq-sdk';
import { buildSystemPrompt } from './systemPrompt';
import { TOOLS, VALID_PATHS } from './tools';
import { hotelPath, resolveHotel, searchHotels } from './hotelDirectory';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

/** True when a Groq API key has been provided at build time. */
export const isConciergeConfigured = () => Boolean(API_KEY);

let client;
function getClient() {
  if (!client) {
    // NOTE: this runs in the browser, so the key is exposed to the client.
    // For production, proxy these calls through a small backend instead.
    client = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  }
  return client;
}

/** Merge streamed tool_call deltas (keyed by index) into full tool calls. */
function accumulateToolCalls(store, deltaCalls) {
  for (const call of deltaCalls) {
    const slot = (store[call.index] ??= { id: '', name: '', arguments: '' });
    if (call.id) slot.id = call.id;
    if (call.function?.name) slot.name = call.function.name;
    if (call.function?.arguments) slot.arguments += call.function.arguments;
  }
}

/** Tool arguments arrive as a JSON string that the model sometimes malforms. */
function parseArgs(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function runNavigate(args, onNavigate) {
  const { path } = args;
  if (path && VALID_PATHS.has(path)) {
    onNavigate?.(path);
    return `Navigated the visitor to ${path}.`;
  }
  return `Could not navigate: "${path}" is not a valid page.`;
}

/**
 * Hotel search. The result is the ONLY hotel data the model should quote, so
 * it is returned as compact JSON rather than prose.
 */
function runFindHotels(args, hotels) {
  const matches = searchHotels(hotels, {
    query: args.query ?? '',
    // `?? undefined` because the model may send an explicit null, which the
    // search treats as "no bound" rather than a numeric comparison.
    maxPrice: args.maxPricePerNight ?? undefined,
    minPrice: args.minPricePerNight ?? undefined,
    limit: 5,
  });

  if (!matches.length) {
    return JSON.stringify({
      matches: [],
      note: 'No hotel matched. Suggest the /hotels page or a wider budget — do not invent one.',
    });
  }

  return JSON.stringify({
    matches: matches.map((h) => ({
      id: h.id,
      name: h.name,
      from: h.priceLabel,
      currency: h.currency,
      rooms: h.roomTypes,
      board: h.board,
      suits: h.guestTags,
      periods: h.periods,
      page: h.path,
    })),
  });
}

/** Open one hotel's page, or its booking flow. */
function runOpenHotel(args, hotels, onNavigate) {
  const hotel = resolveHotel(hotels, args.hotelId);
  if (!hotel) {
    return `No hotel matches "${args.hotelId}". Call findHotels first, then use the id it returns.`;
  }

  const path = hotelPath(hotel.id, { book: Boolean(args.startBooking) });
  onNavigate?.(path);
  return `Opened ${hotel.name} at ${path}. Tell the visitor what they will see there in one short sentence.`;
}

/**
 * One streamed conversation, looping while the model keeps calling tools.
 *
 * @param {boolean} withTools false disables tool use entirely — the fallback
 *   path when the provider fails to generate a valid tool call.
 * @returns {Promise<string>} the assembled reply text.
 */
async function runRounds({ messages, hotels, withTools, onToken, onNavigate, signal }) {
  const groq = getClient();
  let full = '';

  for (let round = 0; round < 4; round += 1) {
    const stream = await groq.chat.completions.create(
      {
        model: MODEL,
        messages,
        ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
        temperature: 0.6,
        max_tokens: 800,
        stream: true,
      },
      { signal },
    );

    let content = '';
    const toolStore = {};

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;
      if (delta.content) {
        content += delta.content;
        full += delta.content;
        onToken?.(delta.content);
      }
      if (delta.tool_calls) accumulateToolCalls(toolStore, delta.tool_calls);
    }

    const toolCalls = Object.values(toolStore).filter((t) => t.name);
    if (toolCalls.length === 0) break; // plain answer — done.

    // Record the assistant turn (with its tool calls) then each tool result.
    messages.push({
      role: 'assistant',
      content: content || null,
      tool_calls: toolCalls.map((t) => ({
        id: t.id,
        type: 'function',
        function: { name: t.name, arguments: t.arguments },
      })),
    });

    for (const t of toolCalls) {
      const args = parseArgs(t.arguments);
      let result;
      if (t.name === 'navigateTo') result = runNavigate(args, onNavigate);
      else if (t.name === 'findHotels') result = runFindHotels(args, hotels);
      else if (t.name === 'openHotel') result = runOpenHotel(args, hotels, onNavigate);
      else result = `Unknown tool "${t.name}".`;

      messages.push({ role: 'tool', tool_call_id: t.id, content: result });
    }
    // Loop again so the model can confirm in natural language.
  }

  return full;
}

/**
 * Streams a concierge reply, handling `navigateTo` / `findHotels` / `openHotel`
 * calls in an agentic loop. Calls `onToken(text)` for each streamed chunk of
 * the final answer, and `onNavigate(path)` when the assistant moves the
 * visitor.
 *
 * @returns {Promise<string>} the full assembled reply text.
 */
export async function streamConcierge({
  history,
  currentPath = '/',
  hotels = [],
  onToken,
  onNavigate,
  signal,
} = {}) {
  const system = { role: 'system', content: buildSystemPrompt({ currentPath, hotels }) };

  try {
    return await runRounds({
      messages: [system, ...history],
      hotels,
      withTools: true,
      onToken,
      onNavigate,
      signal,
    });
  } catch (err) {
    // Aborts are the visitor's own doing, and a rate limit needs to surface as
    // itself — a retry would only burn more of the budget.
    if (err?.name === 'AbortError' || err?.status === 429) throw err;

    // Anything else here is usually the provider failing to generate a valid
    // tool call. The visitor asked a question; answer it without tools rather
    // than showing them an error. Fresh message list so no half-finished tool
    // turn is replayed.
    console.warn('Concierge: tool round failed, answering without tools —', err?.message);
    return runRounds({
      messages: [system, ...history],
      hotels,
      withTools: false,
      onToken,
      onNavigate,
      signal,
    });
  }
}
