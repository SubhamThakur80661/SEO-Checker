import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Loader2, Link as LinkIcon, FileText, Sparkles } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function scoreVerdict(score) {
  if (score >= 90) return { label: "In good shape", stroke: "#5F6B4C", text: "text-moss" };
  if (score >= 70) return { label: "Room to improve", stroke: "#8B957B", text: "text-bark" };
  return { label: "Needs work", stroke: "#B45309", text: "text-amber-800" };
}

function ScoreRing({ score }) {
  const verdict = scoreVerdict(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#E9E4D8" strokeWidth="10" />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={verdict.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-olivewood">{score}</span>
        </div>
      </div>
      <p className={`mt-3 font-semibold ${verdict.text}`}>{verdict.label}</p>
      <p className="text-sm text-bark">out of 100</p>
    </div>
  );
}

function Audit() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url) return;

    try {
      setLoading(true);
      setResult(null);

      let submitUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        submitUrl = 'https://' + url;
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/audit`,
        { url: submitUrl },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data.success) {
        setResult(res.data);
      } else {
        setResult({ error: res.data.error || "Audit failed" });
      }
    } catch (err) {
      console.error(err);
      setResult({ error: err.response?.data?.error || "Could not reach the server. Check that it is running and try again." });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = result && !result.error
    ? result.aiSuggestions.split('\n').filter(s => s.trim().length > 0)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-olivewood tracking-tight">SEO audit</h1>
        <p className="text-lg text-bark mt-2 max-w-2xl">
          Paste a URL. We will check the page's title, description, and a few things
          search engines look at.
        </p>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-card border border-sand/60 flex items-center gap-2 mb-8 focus-within:ring-4 focus-within:ring-sage/15 focus-within:border-sage transition-all">
        <div className="pl-3 text-bark">
          <LinkIcon size={19} />
        </div>
        <input
          placeholder="example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-olivewood placeholder:text-bark/50 font-medium min-w-0"
          aria-label="Website URL to audit"
        />
        <button
          onClick={analyze}
          disabled={loading || !url}
          className="bg-olivewood hover:bg-moss disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shrink-0"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {loading ? "Checking…" : "Audit"}
        </button>
      </div>

      {result && result.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium shadow-card mb-8">
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-card flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-bark uppercase tracking-wider mb-5">Overall score</h3>
            <ScoreRing score={result.seo.score} />
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-sand/60 shadow-card">
            <h3 className="flex items-center gap-2 text-lg font-bold text-olivewood mb-5">
              <FileText className="text-moss" size={20} />
              What the page says about itself
            </h3>
            <div className="mb-4 bg-paper p-4 rounded-xl border border-sand/50">
              <span className="text-xs font-semibold tracking-wider text-bark uppercase">Title tag</span>
              <p className="text-olivewood font-semibold mt-1 leading-snug">{result.site.title}</p>
            </div>
            <div className="bg-paper p-4 rounded-xl border border-sand/50">
              <span className="text-xs font-semibold tracking-wider text-bark uppercase">Meta description</span>
              <p className="text-bark mt-1 leading-relaxed">{result.site.metaDescription}</p>
            </div>
          </div>

          <div className="md:col-span-3 bg-white p-6 sm:p-7 rounded-2xl border border-sand/60 shadow-card">
            <h3 className="flex items-center gap-2 text-lg font-bold text-olivewood mb-5">
              <Sparkles className="text-moss" size={20} />
              What to fix
            </h3>
            <ol className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-3.5 text-olivewood">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-sage/15 text-moss text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{suggestion.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Audit;
