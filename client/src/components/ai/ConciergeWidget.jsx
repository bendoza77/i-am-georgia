import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Send, Square, RotateCcw, MapPin } from 'lucide-react';
import { useConcierge } from '../../ai/useConcierge';
import { isConciergeConfigured } from '../../ai/groqClient';
import { cn } from '../../utils/cn';

const SUGGESTIONS = [
  'Show me the tours',
  'Find a hotel in Batumi',
  'Best time to visit Kazbegi?',
  'Where do I book?',
];

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-brand-500 text-white'
            : 'rounded-bl-md bg-sand-100 text-ink-800',
        )}
      >
        {msg.pending && !msg.content ? <TypingDots /> : msg.content}
      </div>
    </div>
  );
}

export default function ConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const { messages, streaming, error, send, stop, reset } = useConcierge();
  const configured = isConciergeConfigured();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the transcript pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (text) => {
    const value = (text ?? draft).trim();
    if (!value) return;
    setDraft('');
    send(value);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const showSuggestions = messages.length <= 1 && !streaming;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            onClick={() => setOpen(true)}
            aria-label="Open the travel concierge"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group fixed bottom-6 right-6 z-[90] flex h-14 items-center gap-2.5 rounded-full bg-ink-900 pl-4 pr-5 text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-brand-500 sm:bottom-8 sm:right-8"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white transition-colors group-hover:bg-white group-hover:text-brand-600">
              <Sparkles size={18} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold-400 ring-2 ring-ink-900 group-hover:ring-brand-500" />
            </span>
            <span className="text-sm font-semibold">Ask Nino</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-4 bottom-4 z-[95] flex h-[min(600px,80vh)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-ink-100 bg-white shadow-[var(--shadow-lift)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem] lg:right-8 lg:bottom-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-950 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Nino · Travel Concierge</p>
                  <p className="flex items-center gap-1 text-xs text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · knows this site
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  aria-label="Start over"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close concierge"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      disabled={!configured}
                      className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {!configured && (
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-gold-500/10 px-3 py-2.5 text-xs leading-relaxed text-ink-600">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    The concierge needs a Groq API key. Add{' '}
                    <code className="rounded bg-ink-900/5 px-1">VITE_GROQ_API_KEY</code> to{' '}
                    <code className="rounded bg-ink-900/5 px-1">client/.env.local</code> and restart the dev server.
                  </span>
                </div>
              )}

              {error && <p className="px-1 text-xs text-red-500">{error}</p>}
            </div>

            {/* Composer */}
            <div className="border-t border-ink-100 bg-white p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-sand-50 px-3 py-2 focus-within:border-brand-400">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  disabled={!configured}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={configured ? 'Ask about trips, hotels, or where to click…' : 'Concierge not configured'}
                  className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 disabled:opacity-60"
                />
                {streaming ? (
                  <button
                    onClick={stop}
                    aria-label="Stop"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-white transition-colors hover:bg-ink-700"
                  >
                    <Square size={15} className="fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => submit()}
                    disabled={!draft.trim() || !configured}
                    aria-label="Send"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[0.65rem] text-ink-400">
                AI concierge · may occasionally be imprecise — confirm bookings with our team.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
