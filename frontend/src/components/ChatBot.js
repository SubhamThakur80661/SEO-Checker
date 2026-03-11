import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

function ChatBot(){
  const [open,setOpen] = useState(false);
  const [message,setMessage] = useState("");
  const [chat,setChat] = useState([
    { q: "", a: "Hi! I'm your RankPilot SEO Assistant. How can I help you improve your rankings today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading, open]);

  const ask = async (e) => {
    e?.preventDefault();
    if(!message.trim()) return;
    
    const userMsg = message;
    setMessage("");
    setChat(prev => [...prev, { q: userMsg, a: "" }]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({message: userMsg})
      });
      
      if(res.ok) {
        const data = await res.json();
        setChat(prev => {
          const newChat = [...prev];
          newChat[newChat.length - 1].a = data.answer;
          return newChat;
        });
      } else {
        throw new Error("Network error");
      }
    } catch(err) {
      // Mock response for showcase
      setTimeout(() => {
        setChat(prev => {
          const newChat = [...prev];
          newChat[newChat.length - 1].a = "Here is a simulated response indicating how the AI would reply to your SEO query: Focus on high-intent long-tail keywords and ensure your Core Web Vitals are within the green zone.";
          return newChat;
        });
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  return(
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all z-50 flex items-center justify-center group"
          >
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 scale-110 opacity-0 group-hover:animate-ping"></div>
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">SEO Assistant</h4>
                  <p className="text-emerald-100 text-xs">Always online</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {chat.map((c, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {c.q && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-end max-w-[85%] flex items-end gap-2"
                    >
                      <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-br-sm shadow-sm text-sm">
                        {c.q}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={14} />
                      </div>
                    </motion.div>
                  )}
                  {c.a && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-start max-w-[85%] flex items-end gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Bot size={14} />
                      </div>
                      <div className="bg-white border border-slate-100 text-slate-700 p-3 rounded-2xl rounded-bl-sm shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
                        {c.a}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="self-start max-w-[85%] flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={ask} className="p-3 bg-white border-t border-slate-100 m-2 rounded-xl flex items-center gap-2 shadow-sm shrink-0">
              <input
                placeholder="Ask your SEO question..."
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                className="flex-1 border-none outline-none py-2 px-3 text-sm text-slate-700 bg-transparent placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white p-2 rounded-lg transition-colors"
                aria-label="Send message"
              >
                <Send size={18} className={(message.trim() && !loading) ? "" : "opacity-70"} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot;