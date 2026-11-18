import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SearchCheck, KeyRound, History as HistoryIcon, ArrowRight, TrendingUp, Gauge } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { scoreTone } from "../components/ui/ScoreRing.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function shortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState(null);
  const [keywordSearches, setKeywordSearches] = useState(null);
  const [error, setError] = useState("");
  const [quickUrl, setQuickUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/api/audit/history").then((r) => r.data?.data || []),
      api.get("/api/keywords/history").then((r) => r.data?.data || []),
    ])
      .then(([a, k]) => {
        if (cancelled) return;
        setAudits(a);
        setKeywordSearches(k);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!audits) return null;
    const scores = audits.map((a) => a.seoScore).filter((s) => typeof s === "number");
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
    return {
      total: audits.length,
      avg,
      latest: scores.length ? audits[0].seoScore : null,
      keywords: keywordSearches ? keywordSearches.length : 0,
    };
  }, [audits, keywordSearches]);

  const trend = useMemo(() => {
    if (!audits || audits.length < 2) return [];
    return [...audits]
      .reverse()
      .map((a) => ({ date: shortDate(a.createdAt), score: a.seoScore, url: a.url }));
  }, [audits]);

  const quickAudit = (e) => {
    e.preventDefault();
    const url = quickUrl.trim();
    if (!url) return;
    navigate("/audit", { state: { url } });
  };

  const loading = audits === null;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          {greeting()}, {user?.name || "there"}
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          {user?.isGuest
            ? "You're browsing as a guest — audits you run are saved to the shared guest account."
            : "Here's how your audited sites are doing."}
        </p>
      </motion.div>

      {error && (
        <Card className="border-critical/40 bg-critical-soft">
          <CardBody>
            <p className="text-sm text-critical">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Quick audit */}
      <Card>
        <CardBody>
          <form onSubmit={quickAudit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="quick-url" className="sr-only">
              Website URL to audit
            </label>
            <input
              id="quick-url"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Paste a website URL — example.com"
              className="h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <Button type="submit" size="lg" disabled={!quickUrl.trim()}>
              <SearchCheck className="h-4 w-4" aria-hidden />
              Run audit
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: SearchCheck, label: "Audits run", value: loading ? "…" : stats.total, sub: "all time" },
          { icon: Gauge, label: "Average score", value: loading ? "…" : stats.avg ?? "—", sub: stats.avg != null ? scoreTone(stats.avg).label : "no audits yet" },
          { icon: TrendingUp, label: "Latest score", value: loading ? "…" : stats.latest ?? "—", sub: stats.latest != null ? scoreTone(stats.latest).label : "no audits yet" },
          { icon: KeyRound, label: "Keyword searches", value: loading ? "…" : stats.keywords, sub: "topics explored" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label}>
            <CardBody className="py-4">
              <div className="flex items-center gap-2 text-muted">
                <Icon className="h-4 w-4" aria-hidden />
                <p className="text-[13px] font-medium">{label}</p>
              </div>
              <p className="tabular mt-1.5 font-display text-[28px] font-bold leading-none text-ink">{value}</p>
              <p className="mt-1.5 text-xs text-faint">{sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Trend */}
      {trend.length >= 2 && (
        <Card>
          <CardHeader title="Score trend" subtitle="Your audit scores over time" />
          <CardBody>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#5C665F" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5C665F" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v} / 100`, "Score"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.url || ""}
                    contentStyle={{ borderRadius: 10, border: "1px solid #E5E7E0", fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#4D7C0F" strokeWidth={2} fill="#4D7C0F" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent audits */}
      <Card>
        <CardHeader
          title="Recent audits"
          action={
            <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark">
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        {loading ? (
          <CardBody>
            <p className="text-sm text-muted">Loading…</p>
          </CardBody>
        ) : audits.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No audits yet"
            body="Run your first audit above — it takes about a minute and shows every issue on the page."
            action={<Button onClick={() => navigate("/audit")}>Go to SEO Audit</Button>}
          />
        ) : (
          <ul className="divide-y divide-line">
            {audits.slice(0, 5).map((a) => {
              const tone = scoreTone(a.seoScore);
              return (
                <li key={a._id}>
                  <Link
                    to={`/history/${a._id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-wash/60"
                  >
                    <span
                      className="tabular flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base font-bold"
                      style={{ background: tone.track, color: tone.ring }}
                    >
                      {a.seoScore}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{a.url}</span>
                      <span className="text-[13px] text-muted">
                        {shortDate(a.createdAt)} · {(a.issueCounts?.critical || 0) + (a.issueCounts?.warning || 0)} issues
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
