/**
 * Dark ambient backdrop for the login page: drifting lime/emerald aurora
 * orbs + a faint dot grid. Pure CSS animation — the global
 * prefers-reduced-motion rule freezes it. Decorative only.
 */
export default function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="rv-dot-grid absolute inset-0 opacity-60" />
      <div className="rv-aurora left-[-10%] top-[-15%] h-[420px] w-[420px] bg-lime-500/25" />
      <div
        className="rv-aurora right-[-5%] top-[30%] h-[360px] w-[360px] bg-emerald-400/20"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="rv-aurora bottom-[-20%] left-[30%] h-[380px] w-[380px] bg-acid/15"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
