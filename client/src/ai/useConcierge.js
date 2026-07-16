import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { streamConcierge } from './groqClient';

let uid = 0;
const nextId = () => `m-${Date.now()}-${(uid += 1)}`;

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi, I'm Nino — your concierge for I'm Georgia. Ask me anything about planning a trip, or say things like “show me the tours” or “where do I book a hotel?” and I'll take you there.",
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

      // History for the API is the plain user/assistant transcript so far.
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'greeting' && (m.role === 'user' || m.role === 'assistant'))
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
        await streamConcierge({
          history,
          currentPath: location.pathname,
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
          setError('Something went wrong reaching the concierge. Please try again.');
          patch(botId, () => ({
            pending: false,
            content:
              "Sorry — I couldn't reach the assistant just now. Please try again in a moment.",
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
