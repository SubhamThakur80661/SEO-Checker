import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Sparkles, KeyRound, Loader2, Check } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Keywords() {
  const [topic, setTopic] = useState("");
  const [searchedTopic, setSearchedTopic] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const generateKeywords = async () => {
    if (!topic) return;

    setLoading(true);
    setError(null);
    setKeywords([]);
    setCopied(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/keywords`,
        { topic },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data.success) {
        setKeywords(res.data.data.map(item => item.keyword));
        setSearchedTopic(topic);
      } else {
        setError(res.data.error || "Could not generate keywords");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Could not reach the server. Check that it is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyKeyword = async (keyword) => {
    try {
      await navigator.clipboard.writeText(keyword);
      setCopied(keyword);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-8">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-lime">02 / Keywords</p>
        <h1 className="font-display font-wide text-4xl font-black tracking-tight sm:text-6xl">Keyword research</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
          Type a topic. You will get keyword ideas for it. Click one to copy it.
        </p>
      </div>

      <div className="mb-8 flex max-w-2xl items-center gap-2 border border-white/12 bg-coal p-2 transition-all focus-within:border-lime/60 focus-within:ring-2 focus-within:ring-lime/20">
        <div className="pl-3 text-smoke">
          <KeyRound size={19} />
        </div>
        <input
          placeholder="A topic, e.g. email marketing"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateKeywords()}
          className="min-w-0 flex-1 border-none bg-transparent px-2 py-2.5 font-medium text-paper outline-none placeholder:text-smoke/50"
          aria-label="Topic for keyword research"
        />
        <button
          onClick={generateKeywords}
          disabled={loading || !topic}
          className="flex shrink-0 items-center gap-2 bg-lime px-5 py-2.5 font-display font-extrabold tracking-tight text-ink transition-colors hover:bg-paper disabled:opacity-50"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
          {loading ? "Thinking…" : "Generate"}
        </button>
      </div>

      {error && (
        <div className="mb-8 max-w-2xl border border-red-400/30 bg-red-500/10 p-4 font-medium text-red-300">
          {error}
        </div>
      )}

      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl border border-white/12 bg-coal p-6 sm:p-7"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-display text-lg font-extrabold tracking-tight text-paper">
              Ideas for “{searchedTopic}”
            </h3>
            <span className="shrink-0 border border-lime/50 bg-lime/10 px-3 py-1.5 font-mono text-xs font-semibold text-lime">
              {keywords.length} found
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {keywords.map((k) => (
              <button
                key={k}
                onClick={() => copyKeyword(k)}
                className={`flex items-center gap-1.5 border px-4 py-2 text-sm font-medium transition-colors ${
                  copied === k
                    ? 'border-lime bg-lime text-ink'
                    : 'border-white/15 bg-panel text-paper hover:border-lime/70 hover:text-lime'
                }`}
                title="Click to copy"
              >
                {copied === k && <Check size={14} />}
                {copied === k ? 'Copied' : k}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Keywords;
