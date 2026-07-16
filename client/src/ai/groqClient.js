import Groq from 'groq-sdk';
import { buildSystemPrompt } from './systemPrompt';
import { TOOLS, VALID_PATHS } from './tools';

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

function runNavigate(rawArgs, onNavigate) {
  let path;
  try {
    path = JSON.parse(rawArgs || '{}').path;
  } catch {
    path = undefined;
  }
  if (path && VALID_PATHS.has(path)) {
    onNavigate?.(path);
    return `Navigated the visitor to ${path}.`;
  }
  return `Could not navigate: "${path}" is not a valid page.`;
}

/**
 * Streams a concierge reply, handling any `navigateTo` tool calls in an
 * agentic loop. Calls `onToken(text)` for each streamed chunk of the final
 * answer, and `onNavigate(path)` when the assistant moves the visitor.
 *
 * @returns {Promise<string>} the full assembled reply text.
 */
export async function streamConcierge({
  history,
  currentPath = '/',
  onToken,
  onNavigate,
  signal,
} = {}) {
  const groq = getClient();
  const messages = [
    { role: 'system', content: buildSystemPrompt({ currentPath }) },
    ...history,
  ];

  let full = '';

  for (let round = 0; round < 4; round += 1) {
    const stream = await groq.chat.completions.create(
      {
        model: MODEL,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
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
      const result =
        t.name === 'navigateTo'
          ? runNavigate(t.arguments, onNavigate)
          : `Unknown tool "${t.name}".`;
      messages.push({ role: 'tool', tool_call_id: t.id, content: result });
    }
    // Loop again so the model can confirm in natural language.
  }

  return full;
}
