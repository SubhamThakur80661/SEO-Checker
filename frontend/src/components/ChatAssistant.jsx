import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import Button from "./ui/Button.jsx";

/**
 * Floating SEO assistant. The backend is rule-based (no LLM): it answers
 * from a fixed SEO knowledge base, so the intro says so honestly.
 */
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi — I can explain SEO basics and what your audit results mean. Ask me about scores, titles, meta descriptions, or any check you saw.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const reduceMotion = useReducedMotion();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const res = await api.post("/api/chat/chat", { message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.data?.answer || "I don't have an answer for that yet." }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Sorry — ${getErrorMessage(err)}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="no-print fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 flex h-[420px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
            role="dialog"
            aria-label="SEO assistant"
          >
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
                <Bot className="h-4 w-4" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">SEO Assistant</p>
                <p className="text-xs text-muted">Rule-based answers, no AI chat</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-wash hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user" ? "bg-primary text-white" : "bg-wash text-ink"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-wash px-3 py-2 text-sm text-muted">Thinking…</div>
                </div>
              )}
            </div>

            <form
              className="flex items-center gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask about SEO
              </label>
              <input
                ref={inputRef}
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about scores, titles, links…"
                className="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <Button type="submit" size="sm" disabled={sending || !input.trim()} aria-label="Send message">
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close SEO assistant" : "Open SEO assistant"}
        aria-expanded={open}
        className="ml-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-sidebar text-white shadow-lg transition-colors hover:bg-ink"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
}
