import { useEffect, useRef } from "react";
import { TrendingUp, FileSearch, KeyRound, History as HistoryIcon, ArrowDownRight } from "lucide-react";
import { gsap, hasFinePointer, prefersReducedMotion, revealLines, fadeUp } from "../lib/motion";

const CAPABILITIES = [
  { n: "01", icon: FileSearch, title: "Audit any page", text: "Title, description, and the basics search engines check." },
  { n: "02", icon: KeyRound, title: "Keyword ideas", text: "Type a topic, get words people actually search for." },
  { n: "03", icon: HistoryIcon, title: "Everything kept", text: "Past audits and searches stay in one place." },
];

const MARQUEE = ["Audit", "Keywords", "History", "Titles", "Scores", "Links", "Search"];

function AuthLayout({ title, subtitle, children, footer }) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const glowRef = useRef(null);
  const scanRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        scanRef.current,
        { top: "0%", opacity: 0.9 },
        { top: "100%", opacity: 0, duration: 1.4, ease: "power2.inOut" },
        0.1
      );
      tl.add(revealLines(root), 0.25);
      tl.add(fadeUp(root, "[data-intro]", 0), 0.55);
    }, root);
    return () => ctx.revert();
  }, []);

  const onRootMove = (e) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const glow = glowRef.current;
    if (glow) {
      gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.9, ease: "power3.out" });
    }
  };

  const onPanelMove = (e) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    gsap.to(panel, {
      rotateY: (px - 0.5) * 7,
      rotateX: (0.5 - py) * 7,
      duration: 0.5,
      ease: "power3.out",
      transformPerspective: 900,
    });
    panel.style.setProperty("--mx", `${px * 100}%`);
    panel.style.setProperty("--my", `${py * 100}%`);
  };

  const onPanelLeave = () => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      ref={rootRef}
      onMouseMove={onRootMove}
      className="relative flex min-h-screen flex-col overflow-x-clip bg-ink font-sans text-paper"
    >
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(215,255,62,0.22) 0%, transparent 62%)" }}
      />
      <div
        ref={scanRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 z-10 h-px w-full bg-lime/80 opacity-0 shadow-[0_0_24px_2px_rgba(215,255,62,0.55)]"
      />

      <header className="glass-bar relative z-20 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-lime text-ink">
            <TrendingUp size={20} strokeWidth={2.5} />
          </span>
          <span className="font-display font-wide text-lg font-black tracking-tight">
            RANKPILOT
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">
          <span className="animate-blink inline-block h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="hidden sm:inline">SEO checker</span>
          <span className="text-paper/40">/</span>
          <span>{title === "Create an account" ? "Sign up" : "Sign in"}</span>
        </div>
      </header>

      <main className="relative z-20 grid flex-1 lg:grid-cols-12">
        <section className="flex flex-col justify-between px-5 pb-10 pt-10 sm:px-8 lg:col-span-7 lg:pb-14 lg:pt-14 xl:px-12">
          <div>
            <p data-intro className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-lime sm:mb-8">
              01 / What this does
            </p>
            <h1 className="font-display font-wide text-[clamp(3.4rem,10vw,8.25rem)] font-black leading-[0.92] tracking-[-0.03em]">
              <span className="mask-line"><span>See what</span></span>
              <span className="mask-line"><span className="text-outline">search</span></span>
              <span className="mask-line"><span>sees<span className="text-lime">.</span></span></span>
            </h1>
            <p data-intro className="mt-7 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
              A small tool that reads a page the way a search engine does, then tells
              you what to fix in plain words.
            </p>
          </div>

          <div className="mt-12 lg:mt-16">
            {CAPABILITIES.map(({ n, icon: Icon, title: t, text }) => (
              <div
                key={n}
                data-intro
                className="group flex items-baseline gap-4 border-t border-white/10 py-4 transition-colors last:border-b hover:border-lime/40 sm:gap-6"
              >
                <span className="font-mono text-xs text-lime">{n}</span>
                <span className="flex w-8 shrink-0 items-center text-smoke transition-colors group-hover:text-lime">
                  <Icon size={18} />
                </span>
                <div className="flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-display text-lg font-bold tracking-tight sm:text-xl">{t}</span>
                  <span className="text-sm leading-relaxed text-smoke">{text}</span>
                </div>
                <ArrowDownRight size={18} className="shrink-0 text-smoke/50 transition-all group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-lime" />
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-start px-5 pb-12 sm:px-8 lg:col-span-5 lg:items-center lg:border-l lg:border-white/10 lg:px-10 lg:pb-14 xl:px-14">
          <div
            ref={panelRef}
            onMouseMove={onPanelMove}
            onMouseLeave={onPanelLeave}
            data-intro
            className="glass-strong relative w-full max-w-md p-6 will-change-transform sm:p-8"
            style={{
              backgroundImage:
                "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgba(215,255,62,0.07), transparent 65%)",
            }}
          >
            <span aria-hidden="true" className="absolute left-0 top-0 h-10 w-1 bg-lime" />
            <div className="mb-7 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">02 / Access</span>
            </div>
            <p className="-mt-4 mb-7 text-sm leading-relaxed text-smoke">{subtitle}</p>

            {children}

            {footer && (
              <p className="mt-7 border-t border-white/10 pt-5 text-center text-sm text-smoke">{footer}</p>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-20 overflow-hidden border-t border-white/10 py-4" aria-hidden="true">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i} className="flex items-center gap-8">
              <span
                className={
                  i % 2 === 0
                    ? "font-display font-wide text-2xl font-black uppercase tracking-tight text-paper/90"
                    : "font-display font-wide text-outline text-2xl font-black uppercase tracking-tight"
                }
              >
                {word}
              </span>
              <span className="h-2 w-2 rotate-45 bg-lime/80" />
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
