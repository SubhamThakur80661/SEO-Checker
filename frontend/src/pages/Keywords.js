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
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-olivewood tracking-tight">Keyword research</h1>
        <p className="text-lg text-bark mt-2 max-w-2xl">
          Type a topic. You will get keyword ideas for it — click one to copy it.
        </p>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-card border border-sand/60 flex items-center gap-2 mb-8 max-w-2xl focus-within:ring-4 focus-within:ring-sage/15 focus-within:border-sage transition-all">
        <div className="pl-3 text-bark">
          <KeyRound size={19} />
        </div>
        <input
          placeholder="A topic, e.g. email marketing"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateKeywords()}
          className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-olivewood placeholder:text-bark/50 font-medium min-w-0"
          aria-label="Topic for keyword research"
        />
        <button
          onClick={generateKeywords}
          disabled={loading || !topic}
          className="bg-olivewood hover:bg-moss disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shrink-0"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
          {loading ? "Thinking…" : "Generate"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium shadow-card mb-8 max-w-2xl">
          {error}
        </div>
      )}

      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-sand/60 rounded-2xl p-6 sm:p-7 shadow-card max-w-3xl"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-olivewood">
              Ideas for “{searchedTopic}”
            </h3>
            <span className="bg-paper border border-sand/60 text-bark text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
              {keywords.length} found
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {keywords.map((k) => (
              <button
                key={k}
                onClick={() => copyKeyword(k)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                  copied === k
                    ? 'bg-sage/20 border-sage text-moss'
                    : 'bg-paper border-sand/70 text-olivewood hover:border-sage hover:bg-sage/10'
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
