import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Globe,
  Info,
  Link2,
  ShieldCheck,
  ShieldAlert,
  Timer,
  FileText,
  Image as ImageIcon,
  XCircle,
} from "lucide-react";
import ScoreRing, { scoreTone } from "./ui/ScoreRing.jsx";
import Badge from "./ui/Badge.jsx";
import { Card, CardHeader, CardBody } from "./ui/Card.jsx";

/**
 * Normalizes the two report shapes the API produces into one:
 * - Live audit:   { reportId, site, seo, recommendations }
 * - Stored report: { _id, url, seoScore, siteData, checks, categories,
 *                    issueCounts, recommendations, isPublic, createdAt }
 * Stored reports keep a flat siteData subset, so anything the stored shape
 * lacks is simply absent (rendered as "—" or omitted, never invented).
 */
export function normalizeReport(input) {
  if (!input) return null;
  if (input.seo && input.site) {
    return {
      url: input.site.finalUrl || input.url || "",
      reportId: input.reportId || input._id || null,
      isPublic: input.isPublic === true,
      createdAt: input.createdAt || null,
      site: input.site,
      seo: input.seo,
      recommendations: input.recommendations || [],
      stored: false,
    };
  }
  const checks = input.checks || [];
  return {
    url: input.url || input.siteData?.finalUrl || "",
    reportId: input._id || null,
    isPublic: input.isPublic === true,
    createdAt: input.createdAt || null,
    site: input.siteData || {},
    seo: {
      score: input.seoScore,
      uncappedScore: undefined,
      categories: input.categories || [],
      checks,
      issues: checks.filter((c) => c.status === "critical" || c.status === "warning"),
      passed: checks.filter((c) => c.status === "good"),
      issueCounts: input.issueCounts || { critical: 0, warning: 0, good: 0, info: 0 },
    },
    recommendations: input.recommendations || [],
    stored: true,
  };
}

const STATUS = {
  critical: { icon: XCircle, tone: "critical", label: "Critical" },
  warning: { icon: AlertTriangle, tone: "warning", label: "Warning" },
  good: { icon: CheckCircle2, tone: "success", label: "Passed" },
  info: { icon: Info, tone: "info", label: "Info" },
};

function formatBytes(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

function capReason(report) {
  const { site, seo } = report;
  if (seo.uncappedScore == null || seo.score >= seo.uncappedScore) return null;
  if (site.https === false) return "Plain HTTP caps the score at 60.";
  const blocked = (seo.checks || []).some(
    (c) =>
      c.category === "indexability" &&
      c.status === "critical" &&
      ["meta_robots", "x_robots_tag", "robots_txt"].includes(c.id)
  );
  if (blocked) return "A noindex tag or robots block caps the score at 40.";
  return `Score capped at ${seo.score} (uncapped: ${seo.uncappedScore}).`;
}

function CheckRow({ check }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS[check.status] || STATUS.info;
  const Icon = meta.icon;
  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-wash/60"
      >
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            check.status === "critical"
              ? "text-critical"
              : check.status === "warning"
                ? "text-warning"
                : check.status === "good"
                  ? "text-success"
                  : "text-info"
          }`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-medium text-ink">{check.title}</span>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </span>
          <span className="mt-0.5 block text-sm leading-relaxed text-muted">{check.message}</span>
          {open && check.recommendation && (
            <span className="mt-2 block rounded-lg bg-primary-soft px-3 py-2 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-primary-dark">Fix: </span>
              {check.recommendation}
            </span>
          )}
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
    </li>
  );
}

function CategorySection({ category, filter }) {
  const checks = (category.checks || []).filter((c) => {
    if (filter === "issues") return c.status === "critical" || c.status === "warning";
    if (filter === "passed") return c.status === "good";
    return true;
  });
  if (checks.length === 0) return null;
  const tone = scoreTone(category.score);
  return (
    <Card>
      <CardHeader
        title={category.name}
        subtitle={`Weight ${Math.round(category.weight * 100)}% of the score · ${checks.length} checks`}
        action={
          <span className="tabular font-display text-xl font-bold" style={{ color: tone.ring }}>
            {category.score}
          </span>
        }
      />
      <div className="px-5 pb-2">
        <div className="h-2 overflow-hidden rounded-full bg-wash" role="presentation">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${category.score}%`, background: tone.ring }}
          />
        </div>
      </div>
      <ul className="pb-2">
        {checks.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </ul>
    </Card>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-wash px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

/**
 * Full report renderer, shared by the Audit page, the History detail view
 * and the public share page. `report` is a raw live result or stored doc.
 */
export default function ReportView({ report: raw }) {
  const report = useMemo(() => normalizeReport(raw), [raw]);
  const [filter, setFilter] = useState("all");
  if (!report) return null;

  const { site, seo, recommendations } = report;
  const tone = scoreTone(seo.score || 0);
  const counts = seo.issueCounts || {};
  const cap = capReason(report);
  const auditedAt = formatDate(report.createdAt);
  const pageUrl = report.url;

  const tabs = [
    { id: "all", label: `All checks (${(seo.checks || []).length})` },
    { id: "issues", label: `Issues (${(counts.critical || 0) + (counts.warning || 0)})` },
    { id: "passed", label: `Passed (${counts.good || 0})` },
  ];

  return (
    <div className="space-y-5">
      {/* Score header */}
      <Card>
        <CardBody className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing score={seo.score || 0} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted">SEO score for</p>
            <h2 className="mt-0.5 break-all font-display text-xl font-bold leading-snug text-ink">
              {domainOf(pageUrl) || pageUrl}
            </h2>
            <p className="mt-1 text-[15px] text-ink-soft">
              <span className="font-semibold" style={{ color: tone.ring }}>
                {tone.label}
              </span>
              {auditedAt ? ` · Audited ${auditedAt}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="critical">{counts.critical || 0} critical</Badge>
              <Badge tone="warning">{counts.warning || 0} warnings</Badge>
              <Badge tone="success">{counts.good || 0} passed</Badge>
              <Badge tone="info">{counts.info || 0} notes</Badge>
            </div>
            {cap ? <p className="mt-3 text-sm text-warning">{cap}</p> : null}
            <p className="mt-3 text-[13px] text-faint">
              A RankVista model score, not a Google score. It reflects this page&apos;s
              on-page checks only.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Page facts */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        <MetaItem icon={Globe} label="Status" value={site.statusCode ? `HTTP ${site.statusCode}` : "—"} />
        <MetaItem icon={Timer} label="Load time" value={formatMs(site.loadTimeMs)} />
        <MetaItem
          icon={site.https ? ShieldCheck : ShieldAlert}
          label="Connection"
          value={site.https === true ? "HTTPS" : site.https === false ? "Plain HTTP" : "—"}
        />
        <MetaItem icon={FileText} label="Words" value={site.wordCount != null ? site.wordCount.toLocaleString() : "—"} />
        <MetaItem icon={Link2} label="Links" value={`${site.internalLinks ?? "—"} in / ${site.externalLinks ?? "—"} out`} />
        <MetaItem
          icon={ImageIcon}
          label="Images"
          value={`${site.imageCount ?? "—"} · ${site.imagesWithoutAlt ?? "—"} missing alt`}
        />
        {site.pageSizeBytes != null && <MetaItem icon={FileText} label="Page size" value={formatBytes(site.pageSizeBytes)} />}
        {site.lang && <MetaItem icon={Globe} label="Language" value={site.lang} />}
      </div>

      {/* Top fixes */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader title="Top fixes" subtitle="The highest-impact changes first" />
          <CardBody className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.checkId} className="rounded-lg border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={rec.priority === "high" ? "critical" : rec.priority === "medium" ? "warning" : "info"}>
                    {rec.priority === "high" ? "High priority" : rec.priority === "medium" ? "Medium priority" : "Low priority"}
                  </Badge>
                  <h4 className="text-[15px] font-semibold text-ink">{rec.title}</h4>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{rec.detail}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  <span className="font-semibold text-primary-dark">Do this: </span>
                  {rec.fix}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Checks by category */}
      <div>
        <div className="no-print mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter checks">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === t.id ? "bg-sidebar text-white" : "bg-wash text-ink-soft hover:bg-line"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {(seo.categories || []).map((cat) => (
            <CategorySection key={cat.id} category={cat} filter={filter} />
          ))}
        </div>
      </div>

      {/* Search + social previews */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Search preview" subtitle="How this page could look in search results" />
          <CardBody>
            <div className="rounded-lg border border-line p-4">
              <p className="flex items-center gap-2 text-[13px] text-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wash text-[10px] font-bold text-ink">
                  {(domainOf(pageUrl) || "R").charAt(0).toUpperCase()}
                </span>
                {domainOf(pageUrl)}
              </p>
              <p className="mt-1.5 text-lg leading-snug text-[#1a0dab] hover:underline">
                {site.title || "No title tag found"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">
                {site.metaDescription || "No meta description found — search engines will pick their own snippet."}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Social preview" subtitle="How this page looks when shared" />
          <CardBody>
            {site.ogTitle || site.ogDescription || site.ogImage ? (
              <div className="overflow-hidden rounded-lg border border-line">
                {site.ogImage ? (
                  <img
                    src={site.ogImage}
                    alt=""
                    className="h-36 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-[13px] uppercase tracking-wide text-faint">{domainOf(pageUrl)}</p>
                  <p className="mt-1 text-[15px] font-semibold leading-snug text-ink">
                    {site.ogTitle || site.title || "No social title"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {site.ogDescription || site.metaDescription || "No social description."}
                  </p>
                  {site.twitterCard && (
                    <p className="mt-2 text-xs text-faint">Twitter card: {site.twitterCard}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-lg bg-wash px-4 py-6 text-center text-sm text-muted">
                No social sharing tags found — shared links will show a plain URL with no
                preview card. Add Open Graph tags to fix that.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Print-only: full check list with fixes */}
      <div className="print-only">
        <h2>Full check list</h2>
        {(seo.categories || []).map((cat) => (
          <div key={cat.id}>
            <h3>
              {cat.name} — {cat.score}/100
            </h3>
            <ul>
              {(cat.checks || []).map((c) => (
                <li key={c.id}>
                  <strong>[{c.status}] {c.title}:</strong> {c.message}
                  {c.recommendation ? ` Fix: ${c.recommendation}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p>Report generated by RankVista · {pageUrl}</p>
      </div>
    </div>
  );
}
