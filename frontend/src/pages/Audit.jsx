import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { SearchCheck, Share2, Printer, RotateCcw, Check, Loader2 } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import ReportView from "../components/ReportView.jsx";
import Button from "../components/ui/Button.jsx";
import { Card, CardBody } from "../components/ui/Card.jsx";
import { Reveal } from "../components/animated.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const PROGRESS_STEPS = [
  "Fetching the page…",
  "Reading the page content…",
  "Running the checks…",
  "Writing up the fixes…",
];

function normalizeUrl(raw) {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function Audit() {
  const location = useLocation();
  const [url, setUrl] = useState(location.state?.url || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const runAudit = useCallback(
    async (target) => {
      const finalUrl = normalizeUrl(target);
      if (!finalUrl) return;
      setLoading(true);
      setError("");
      setResult(null);
      setShared(false);
      setStep(0);
      timerRef.current = setInterval(() => {
        setStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1));
      }, 5000);
      try {
        const res = await api.post("/api/audit", { url: finalUrl });
        setResult(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        clearInterval(timerRef.current);
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Auto-run when navigated to with a prefilled URL (dashboard quick audit,
  // history re-audit) — only once per navigation.
  const prefilled = useRef(location.state?.url || "");
  useEffect(() => {
    if (prefilled.current) {
      const u = prefilled.current;
      prefilled.current = "";
      runAudit(u);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    runAudit(url);
  };

  const toggleShare = async () => {
    const id = result?.reportId;
    if (!id || shareBusy) return;
    setShareBusy(true);
    try {
      const next = !shared;
      const res = await api.post(`/api/audit/report/${id}/share`, { isPublic: next });
      setShared(res.data?.isPublic === true);
      if (next) {
        const link = `${window.location.origin}/report/${id}`;
        try {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">SEO Audit</h1>
        <p className="mt-1 text-[15px] text-muted">
          Paste any public URL. RankVista fetches the page, runs the checks, and
          shows what to fix — usually in under a minute.
        </p>
      </motion.div>

      <Reveal delay={0.05}>
      <Card>
        <CardBody>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="audit-url" className="sr-only">
              Website URL to audit
            </label>
            <input
              id="audit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com/page"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <Button type="submit" size="lg" disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <SearchCheck className="h-4 w-4" aria-hidden />}
              {loading ? "Auditing…" : "Run audit"}
            </Button>
          </form>
          {loading && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted" role="status" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {PROGRESS_STEPS[step]}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-wash" aria-hidden>
              <motion.div
                className="h-full w-1/3 rounded-full bg-primary"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}
          {error && !loading && (
            <p className="mt-3 rounded-lg bg-critical-soft px-3 py-2.5 text-sm text-critical" role="alert">
              {error}
            </p>
          )}
        </CardBody>
      </Card>
      </Reveal>

      {!result && !loading && !error && (
        <Card>
          <EmptyState
            icon={SearchCheck}
            title="Nothing audited yet"
            body="Enter a URL above to see its score, every check that ran, and the fixes that matter most."
          />
        </Card>
      )}

      {result && (
        <>
          <div className="no-print flex flex-wrap gap-2">
            {result.reportId ? (
              <Button variant="secondary" onClick={toggleShare} disabled={shareBusy}>
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                {shared ? (copied ? "Link copied" : "Shared — copy link again") : "Share report"}
              </Button>
            ) : (
              <Button variant="secondary" disabled title="Sign in to save and share reports">
                <Share2 className="h-4 w-4" aria-hidden />
                Share report
              </Button>
            )}
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden />
              Print / Save PDF
            </Button>
            <Button variant="ghost" onClick={() => runAudit(url)} disabled={loading}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Re-run
            </Button>
          </div>
          {shared && result.reportId && (
            <p className="no-print -mt-2 text-sm text-muted">
              Public link:{" "}
              <span className="break-all font-mono text-[13px] text-ink">
                {window.location.origin}/report/{result.reportId}
              </span>
            </p>
          )}
          <ReportView report={result} />
        </>
      )}
    </div>
  );
}
