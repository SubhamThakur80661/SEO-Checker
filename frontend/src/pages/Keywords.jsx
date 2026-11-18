import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { KeyRound, Copy, Check, Loader2, Lightbulb } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const INTENTS = ["Informational", "Commercial", "Transactional"];

export default function Keywords() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    api
      .get("/api/keywords/history")
      .then((r) => setHistory(r.data?.data || []))
      .catch(() => {});
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    const t = topic.trim();
    if (!t || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/keywords", { topic: t });
      setResults(res.data?.data || []);
      setActiveTopic(t);
      const h = await api.get("/api/keywords/history").catch(() => null);
      if (h) setHistory(h.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  const copyAll = () => {
    if (!results?.length) return;
    copy(results.map((r) => r.keyword).join("\n"), "__all__");
  };

  const loadPast = (entry) => {
    setTopic(entry.topic);
    setActiveTopic(entry.topic);
    setResults(entry.results || []);
  };

  const grouped = (intent) => (results || []).filter((r) => r.intent === intent);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">Keyword ideas</h1>
        <p className="mt-1 text-[15px] text-muted">
          Brainstorming patterns for a topic — question forms, modifiers, and
          long-tail combinations. These are ideas, <strong className="font-semibold text-ink">not search-volume data</strong>.
        </p>
      </motion.div>

      <Card>
        <CardBody>
          <form onSubmit={generate} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="keyword-topic" className="sr-only">
              Topic for keyword ideas
            </label>
            <input
              id="keyword-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="A topic — e.g. indoor plants, invoicing software"
              className="h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <Button type="submit" size="lg" disabled={loading || !topic.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
              {loading ? "Thinking…" : "Get ideas"}
            </Button>
          </form>
          {error && (
            <p className="mt-3 rounded-lg bg-critical-soft px-3 py-2.5 text-sm text-critical" role="alert">
              {error}
            </p>
          )}
        </CardBody>
      </Card>

      {!results && (
        <Card>
          <EmptyState
            icon={Lightbulb}
            title="Start with a topic"
            body="Type a product, service, or subject above and you'll get keyword ideas grouped by what the searcher is trying to do."
          />
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader
            title={`Ideas for “${activeTopic}”`}
            subtitle={`${results.length} ideas · click any chip to copy it`}
            action={
              <Button variant="secondary" size="sm" onClick={copyAll}>
                {copiedKey === "__all__" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {copiedKey === "__all__" ? "Copied" : "Copy all"}
              </Button>
            }
          />
          <CardBody className="space-y-5">
            {INTENTS.map((intent) => {
              const items = grouped(intent);
              if (items.length === 0) return null;
              return (
                <div key={intent}>
                  <h3 className="text-sm font-semibold text-ink">{intent}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((item) => {
                      const key = `${intent}:${item.keyword}`;
                      const isCopied = copiedKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => copy(item.keyword, key)}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            isCopied
                              ? "border-primary bg-primary-soft text-primary-dark"
                              : "border-line-strong bg-surface text-ink hover:border-primary hover:bg-primary-soft"
                          }`}
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5 text-faint" aria-hidden />}
                          {item.keyword}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader title="Recent topics" subtitle="Click one to see its ideas again" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 12).map((h) => (
                <button
                  key={h._id}
                  type="button"
                  onClick={() => loadPast(h)}
                  className="cursor-pointer rounded-full bg-wash px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-line hover:text-ink"
                >
                  {h.topic}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
