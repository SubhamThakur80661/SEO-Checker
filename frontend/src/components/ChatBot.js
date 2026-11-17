import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const OFFLINE_REPLY = "I could not reach the server, so I cannot answer that right now. Try again in a bit.";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { q: "", a: "Ask me anything about SEO. Titles, keywords, backlinks, that sort of thing." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading, open]);

  const ask = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setChat(prev => [...prev, { q: userMsg, a: "" }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setChat(prev => {
        const next = [...prev];
        next[next.length - 1].a = data.answer;
        return next;
      });
    } catch (err) {
      setChat(prev => {
        const next = [...prev];
        next[next.length - 1].a = OFFLINE_REPLY;
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-5 z-50 flex items-center justify-center bg-lime p-4 text-ink shadow-lift transition-colors hover:bg-paper md:bottom-6 md:right-6"
            aria-label="Open SEO assistant"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-5 z-50 flex h-[560px] max-h-[80vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden border border-white/12 bg-coal shadow-lift md:bottom-6 md:right-6"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-ink p-4 text-paper">
              <div className="flex items-center gap-3">
                <div className="bg-lime p-2 text-ink">
                  <Bot size={19} />
                </div>
                <div>
                  <h4 className="font-display font-extrabold leading-tight tracking-tight">SEO Assistant</h4>
                  <p className="text-xs text-smoke">Ask about SEO</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-smoke transition-colors hover:bg-white/10 hover:text-paper"
                aria-label="Close chat"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-ink/60 p-4">
              {chat.map((c, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {c.q && (
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex max-w-[85%] items-end gap-2 self-end"
                    >
                      <div className="bg-lime p-3 text-sm font-medium text-ink">
                        {c.q}
                      </div>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-white/10 text-smoke">
                        <User size={13} />
                      </div>
                    </motion.div>
                  )}
                  {c.a && (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex max-w-[85%] items-end gap-2 self-start"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-lime/15 text-lime">
                        <Bot size={13} />
                      </div>
                      <div className="border border-white/10 bg-panel p-3 text-sm leading-relaxed text-paper whitespace-pre-wrap">
                        {c.a}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex max-w-[85%] items-end gap-2 self-start">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-lime/15 text-lime">
                    <Bot size={13} />
                  </div>
                  <div className="flex gap-1 border border-white/10 bg-panel p-4">
                    {[0, 0.2, 0.4].map((delay) => (
                      <motion.div
                        key={delay}
                        className="h-1.5 w-1.5 rounded-full bg-smoke"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={ask} className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-coal p-3">
              <input
                placeholder="Ask about SEO…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-paper outline-none placeholder:text-smoke/50"
                aria-label="Your SEO question"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="bg-lime p-2.5 text-ink transition-colors hover:bg-paper disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBot;
