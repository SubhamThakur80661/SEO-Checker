import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const OFFLINE_REPLY = "I could not reach the server, so I cannot answer that right now. Try again in a bit.";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { q: "", a: "Ask me anything about SEO — titles, keywords, backlinks, that sort of thing." }
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
            className="fixed bottom-6 right-6 bg-olivewood text-white p-4 rounded-full shadow-lift hover:bg-moss transition-colors z-50 flex items-center justify-center"
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
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[80vh] bg-white rounded-2xl shadow-lift border border-sand/60 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-olivewood p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Bot size={19} />
                </div>
                <div>
                  <h4 className="font-semibold leading-tight">SEO Assistant</h4>
                  <p className="text-parchment/60 text-xs">Ask about SEO</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-paper space-y-4">
              {chat.map((c, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {c.q && (
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-end max-w-[85%] flex items-end gap-2"
                    >
                      <div className="bg-olivewood text-white p-3 rounded-2xl rounded-br-sm text-sm">
                        {c.q}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-sand/60 flex items-center justify-center text-bark shrink-0">
                        <User size={13} />
                      </div>
                    </motion.div>
                  )}
                  {c.a && (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-start max-w-[85%] flex items-end gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-moss shrink-0">
                        <Bot size={13} />
                      </div>
                      <div className="bg-white border border-sand/60 text-olivewood p-3 rounded-2xl rounded-bl-sm shadow-card text-sm leading-relaxed whitespace-pre-wrap">
                        {c.a}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="self-start max-w-[85%] flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-moss shrink-0">
                    <Bot size={13} />
                  </div>
                  <div className="bg-white border border-sand/60 p-4 rounded-2xl rounded-bl-sm shadow-card flex gap-1">
                    {[0, 0.2, 0.4].map((delay) => (
                      <motion.div
                        key={delay}
                        className="w-1.5 h-1.5 bg-bark/50 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={ask} className="p-3 bg-white border-t border-sand/60 flex items-center gap-2 shrink-0">
              <input
                placeholder="Ask about SEO…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-none outline-none py-2 px-2 text-sm text-olivewood bg-transparent placeholder:text-bark/50"
                aria-label="Your SEO question"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="bg-olivewood hover:bg-moss disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors"
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
