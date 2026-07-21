import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { streamConcierge } from './groqClient';
import { loadHotelDirectory } from './hotelDirectory';

let uid = 0;
const nextId = () => `m-${Date.now()}-${(uid += 1)}`;

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi, I'm Nino — your concierge for I'm Georgia. I know every hotel we sell and every corner of this site, so ask me things like “find a hotel under $80”, “tell me about Citrus” or “book me a room” and I'll take you straight there.",
};

/**
 * Conversation state + streaming for the AI concierge. Handles optimistic
 * message rendering, token streaming, in-site navigation and cancellation.
 */
export function useConcierge() {
  const [messages, setMessages] = useState([GREETING]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // The hotel catalogue goes into every system prompt. Kick the (cached) load
  // off as soon as the widget mounts so the first question isn't waiting on it.
  const hotelsRef = useRef([]);
  useEffect(() => {
    let alive = true;
    loadHotelDirectory().then((list) => {
      if (alive) hotelsRef.current = list;
    });
    return () => {
      alive = false;
    };
  }, []);

  const patch = useCallback((id, updater) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updater(m) } : m)),
    );
  }, []);

  const send = useCallback(
    async (text) => {
      const clean = text.trim();
      if (!clean || streaming) return;

      setError(null);
      const userMsg = { id: nextId(), role: 'user', content: clean };
      const botId = nextId();

      // History for the API is the plain user/assistant transcript so far,
      // capped: the system prompt already carries the site + hotel knowledge,
      // and an unbounded transcript walks into the provider's per-minute
      // token limit within a few messages.
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'greeting' && (m.role === 'user' || m.role === 'assistant'))
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: botId, role: 'assistant', content: '', pending: true },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // If the catalogue is still in flight, wait for it — answering a hotel
        // question with an empty catalogue is worse than a moment's delay.
        const hotels = hotelsRef.current.length ? hotelsRef.current : await loadHotelDirectory();
        hotelsRef.current = hotels;

        await streamConcierge({
          history,
          currentPath: location.pathname,
          hotels,
          signal: controller.signal,
          onToken: (chunk) =>
            patch(botId, (m) => ({ content: m.content + chunk, pending: false })),
          onNavigate: (path) => {
            if (path !== location.pathname) navigate(path);
          },
        });
        patch(botId, () => ({ pending: false }));
      } catch (err) {
        if (err?.name === 'AbortError') {
          patch(botId, (m) => ({ pending: false, content: m.content }));
        } else {
          console.error('Concierge error:', err);

          // 429 is the provider's per-minute budget, not a broken integration —
          // say so, because "try again in a few seconds" actually works.
          const busy = err?.status === 429;
          setError(
            busy
              ? 'Too many questions in a short window — give it a few seconds.'
              : 'Something went wrong reaching the concierge. Please try again.',
          );
          patch(botId, () => ({
            pending: false,
            content: busy
              ? "I'm catching my breath — I've hit my limit for the minute. Ask me again in a few seconds and I'll pick up where we left off."
              : "Sorry — I couldn't reach the assistant just now. Please try again in a moment.",
          }));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, patch, navigate, location.pathname],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setError(null);
  }, []);

  return { messages, streaming, error, send, stop, reset };
}
