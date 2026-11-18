import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  History as HistoryIcon,
  Search,
  Eye,
  RotateCcw,
  Share2,
  Trash2,
  ArrowLeft,
  Printer,
  Check,
  Loader2,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api, { getErrorMessage } from "../lib/api";
import ReportView from "../components/ReportView.jsx";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { scoreTone } from "../components/ui/ScoreRing.jsx";

function shortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function issueTotal(r) {
  return (r.issueCounts?.critical || 0) + (r.issueCounts?.warning || 0);
}

export default function History() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/audit/history");
      setReports(res.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!reports) return [];
    const q = query.trim().toLowerCase();
    const list = q ? reports.filter((r) => r.url.toLowerCase().includes(q)) : [...reports];
    list.sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "highest") return b.seoScore - a.seoScore;
      if (sort === "lowest") return a.seoScore - b.seoScore;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [reports, query, sort]);

  const trend = useMemo(() => {
    if (!reports || reports.length < 2) return [];
    return [...reports]
      .reverse()
      .map((a) => ({ date: shortDate(a.createdAt), score: a.seoScore, url: a.url }));
  }, [reports]);

  const toggleShare = async (report) => {
    setBusyId(report._id);
    try {
      const next = !report.isPublic;
      await api.post(`/api/audit/report/${report._id}/share`, { isPublic: next });
      setReports((rs) => rs.map((r) => (r._id === report._id ? { ...r, isPublic: next } : r)));
      if (next) {
        await navigator.clipboard.writeText(`${window.location.origin}/report/${report._id}`).catch(() => {});
        setCopiedId(report._id);
        setTimeout(() => setCopiedId(""), 2500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const deleteReport = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/api/audit/report/${id}`);
      setReports((rs) => rs.filter((r) => r._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">History</h1>
        <p className="mt-1 text-[15px] text-muted">Every audit you&apos;ve run, with its score and issues.</p>
      </motion.div>

      {error && (
        <Card className="border-critical/40 bg-critical-soft">
          <CardBody>
            <p className="text-sm text-critical">{error}</p>
          </CardBody>
        </Card>
      )}

      {trend.length >= 2 && (
        <Card>
          <CardHeader title="Score trend" subtitle="Your audit scores over time" />
          <CardBody>
            <div className="h-48">
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

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
            <label htmlFor="history-search" className="sr-only">
              Search audits by URL
            </label>
            <input
              id="history-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by URL…"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-3.5 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <label htmlFor="history-sort" className="sr-only">
            Sort audits
          </label>
          <select
            id="history-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 cursor-pointer rounded-lg border border-line-strong bg-surface px-3 text-[15px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest score</option>
            <option value="lowest">Lowest score</option>
          </select>
        </CardBody>
      </Card>

      {reports === null ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Loading…</p>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={HistoryIcon}
            title={query ? "No audits match that search" : "No audits yet"}
            body={
              query
                ? "Try a different URL or clear the search."
                : "Run your first audit and it will show up here with its score."
            }
            action={
              query ? (
                <Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>
              ) : (
                <Button onClick={() => navigate("/audit")}>Go to SEO Audit</Button>
              )
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => {
            const tone = scoreTone(r.seoScore);
            return (
              <li key={r._id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span
                      className="tabular flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold"
                      style={{ background: tone.track, color: tone.ring }}
                    >
                      {r.seoScore}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-ink">{r.url}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {shortDate(r.createdAt)} · {issueTotal(r)} issues · {tone.label}
                        {r.isPublic ? " · Shared publicly" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/history/${r._id}`)}>
                        <Eye className="h-4 w-4" aria-hidden /> View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/audit", { state: { url: r.url } })}>
                        <RotateCcw className="h-4 w-4" aria-hidden /> Re-audit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleShare(r)} disabled={busyId === r._id}>
                        {copiedId === r._id ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                        {r.isPublic ? (copiedId === r._id ? "Copied" : "Shared") : "Share"}
                      </Button>
                      {confirmDelete === r._id ? (
                        <>
                          <Button variant="danger" size="sm" onClick={() => deleteReport(r._id)} disabled={busyId === r._id}>
                            Confirm delete
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(r._id)} aria-label={`Delete audit of ${r.url}`}>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Detail view for one stored report: /history/:id */
export function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get("/api/audit/history")
      .then((res) => {
        const found = (res.data?.data || []).find((r) => r._id === id);
        if (found) {
          setReport(found);
          setShared(found.isPublic === true);
        } else {
          setError("That report doesn't exist or isn't yours.");
        }
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const toggleShare = async () => {
    if (!report || shareBusy) return;
    setShareBusy(true);
    try {
      const next = !shared;
      const res = await api.post(`/api/audit/report/${report._id}/share`, { isPublic: next });
      setShared(res.data?.isPublic === true);
      if (next) {
        await navigator.clipboard.writeText(`${window.location.origin}/report/${report._id}`).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setShareBusy(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={() => navigate("/history")}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to history
        </Button>
        <Card>
          <EmptyState icon={HistoryIcon} title="Report not found" body={error} />
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardBody>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading report…
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/history")}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to history
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={toggleShare} disabled={shareBusy}>
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
          {shared ? (copied ? "Link copied" : "Shared") : "Share report"}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden /> Print / Save PDF
        </Button>
        <Button variant="ghost" onClick={() => navigate("/audit", { state: { url: report.url } })}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Re-audit
        </Button>
      </div>
      {report.categories == null && (
        <p className="rounded-lg bg-warning-soft px-3 py-2.5 text-sm text-warning">
          Audited with an earlier version — some sections may be missing.
        </p>
      )}
      <ReportView report={report} />
    </div>
  );
}
