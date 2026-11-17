import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Loader2, Link as LinkIcon, FileText, Sparkles } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function scoreVerdict(score) {
  if (score >= 90) return { label: "In good shape", stroke: "#D7FF3E", text: "text-lime" };
  if (score >= 70) return { label: "Room to improve", stroke: "#A3A39B", text: "text-smoke" };
  return { label: "Needs work", stroke: "#F59E0B", text: "text-amber-400" };
}

function ScoreRing({ score }) {
  const verdict = scoreVerdict(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#232326" strokeWidth="10" />
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
          <span className="font-display text-4xl font-black tracking-tight text-paper">{score}</span>
        </div>
      </div>
      <p className={`mt-3 font-semibold ${verdict.text}`}>{verdict.label}</p>
      <p className="text-sm text-smoke">out of 100</p>
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
      className="mx-auto max-w-4xl"
    >
      <div className="mb-8">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-lime">01 / Audit</p>
        <h1 className="font-display font-wide text-4xl font-black tracking-tight sm:text-6xl">SEO audit</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
          Paste a URL. We will check the page's title, description, and a few things
          search engines look at.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-2 border border-white/12 bg-coal p-2 transition-all focus-within:border-lime/60 focus-within:ring-2 focus-within:ring-lime/20">
        <div className="pl-3 text-smoke">
          <LinkIcon size={19} />
        </div>
        <input
          placeholder="example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          className="min-w-0 flex-1 border-none bg-transparent px-2 py-2.5 font-medium text-paper outline-none placeholder:text-smoke/50"
          aria-label="Website URL to audit"
        />
        <button
          onClick={analyze}
          disabled={loading || !url}
          className="flex shrink-0 items-center gap-2 bg-lime px-5 py-2.5 font-display font-extrabold tracking-tight text-ink transition-colors hover:bg-paper disabled:opacity-50"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {loading ? "Checking…" : "Audit"}
        </button>
      </div>

      {result && result.error && (
        <div className="mb-8 border border-red-400/30 bg-red-500/10 p-4 font-medium text-red-300">
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div className="flex flex-col items-center justify-center border border-white/12 bg-coal p-6">
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">Overall score</h3>
            <ScoreRing score={result.seo.score} />
          </div>

          <div className="border border-white/12 bg-coal p-6 md:col-span-2">
            <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
              <FileText className="text-lime" size={20} />
              What the page says about itself
            </h3>
            <div className="mb-4 border border-white/10 bg-panel p-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">Title tag</span>
              <p className="mt-1 font-semibold leading-snug text-paper">{result.site.title}</p>
            </div>
            <div className="border border-white/10 bg-panel p-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">Meta description</span>
              <p className="mt-1 leading-relaxed text-smoke">{result.site.metaDescription}</p>
            </div>
          </div>

          <div className="border border-white/12 bg-coal p-6 sm:p-7 md:col-span-3">
            <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
              <Sparkles className="text-lime" size={20} />
              What to fix
            </h3>
            <ol className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-3.5 text-paper">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-lime font-mono text-xs font-bold text-ink">
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
