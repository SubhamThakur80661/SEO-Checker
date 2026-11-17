import { FileText, Search, ListChecks, ArrowUpRight, ArrowRight } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { gsap, prefersReducedMotion, revealLines, fadeUp } from "../lib/motion";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [auditCount, setAuditCount] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/audit/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data.success) setAuditCount(res.data.data.length);
      } catch {
        // Backend down or unreachable — the count just stays at 0.
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      revealLines(root);
      fadeUp(root, "[data-intro]", 0.35);
    }, root);
    return () => ctx.revert();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const stats = [
    { label: "Credits left", value: user?.credits ?? 'n/a', note: "One audit or keyword search uses one credit." },
    { label: "Audits run", value: auditCount, note: "All of them listed under History." },
    { label: "Account", value: "Active", note: "Signed in and ready to work." },
  ];

  return (
    <div ref={rootRef} className="pb-8">
      <div className="mb-10 sm:mb-14">
        <p data-intro className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-lime">
          Dashboard
        </p>
        <h1 className="font-display font-wide text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.02em]">
          <span className="mask-line"><span>Welcome back,</span></span>
          <span className="mask-line"><span className="text-outline">{firstName}.</span></span>
        </h1>
        <p data-intro className="mt-5 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
          Run an audit, look up keywords, or check what you have done before.
        </p>
      </div>

      <div data-intro className="glass mb-10 px-5 py-2 sm:mb-14 sm:px-6">
        {stats.map(({ label, value, note }) => (
          <div key={label} className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-white/10 py-5 transition-colors last:border-b-0 hover:border-lime/40">
            <span className="w-36 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">{label}</span>
            <span className="font-display text-4xl font-black tracking-tight text-paper sm:text-5xl">{value}</span>
            <span className="text-sm text-smoke">{note}</span>
          </div>
        ))}
      </div>

      <Link to="/audit" data-intro className="group mb-4 block bg-lime p-3 text-ink sm:p-4">
        <div className="glass-lime flex flex-col gap-6 p-7 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center border border-ink/25">
              <FileText size={22} />
            </span>
            <h3 className="font-display font-wide text-3xl font-black tracking-tight sm:text-5xl">Run an SEO audit</h3>
            <p className="mt-3 max-w-md leading-relaxed text-ink/70">
              Paste a URL and get a plain report on the page's title, description, and the
              basics search engines check.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            Start
            <span className="flex h-11 w-11 items-center justify-center bg-ink text-lime transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={20} />
            </span>
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link to="/keywords" data-intro className="glass group block p-7 transition-colors hover:border-lime/60">
          <span className="mb-5 flex h-12 w-12 items-center justify-center border border-white/12 text-lime">
            <Search size={22} />
          </span>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Keyword research</h3>
          <p className="mt-2 leading-relaxed text-smoke">
            Type a topic and get keyword ideas for your next post or page.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-lime">
            Find keywords
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link to="/audit" data-intro className="glass group block p-7 transition-colors hover:border-lime/60">
          <span className="mb-5 flex h-12 w-12 items-center justify-center border border-white/12 text-lime">
            <ListChecks size={22} />
          </span>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">What to fix next</h3>
          <p className="mt-2 leading-relaxed text-smoke">
            Every audit ends with a short list of fixes, in plain language.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-lime">
            Start with an audit
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
