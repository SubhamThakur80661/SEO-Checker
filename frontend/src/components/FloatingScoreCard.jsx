import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { CheckCircle2, Link2, SearchCheck } from "lucide-react";
import ScoreRing, { scoreTone } from "./ui/ScoreRing.jsx";

/**
 * Login hero: a CSS-3D audit card that tilts toward the cursor, with
 * floating glass chips. The score is the real example.com audit
 * RankVista produced during verification (74) — illustrative, not live
 * data. The chips state true product facts, not invented metrics.
 */
export default function FloatingScoreCard() {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 150, damping: 18 });
  const chipX = useSpring(useTransform(mx, [0, 1], [10, -10]), { stiffness: 120, damping: 20 });
  const chipY = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 120, damping: 20 });
  const tone = scoreTone(74);

  const onMove = (e) => {
    if (reduceMotion) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const tiltStyle = reduceMotion
    ? undefined
    : { rotateX, rotateY, transformStyle: "preserve-3d" };
  const chipStyle = reduceMotion ? undefined : { x: chipX, y: chipY };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="rv-tilt-scene relative mx-auto w-full max-w-sm"
      data-rv="floating-score"
    >
      <div aria-hidden className="absolute -inset-6 rounded-full bg-lime-500/20 blur-3xl" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={tiltStyle}
        className="rv-tilt-card relative rounded-2xl bg-surface p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="truncate font-display text-[15px] font-bold text-ink">example.com</p>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-dark">
            Sample audit
          </span>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <ScoreRing score={74} size={110} stroke={10} />
          <div>
            <p className="font-display text-lg font-bold leading-tight" style={{ color: tone.ring }}>
              {tone.label}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              74 out of 100 — a real RankVista model score, not a Google score.
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-wash">
          <motion.div
            className="h-full rounded-full"
            style={{ background: tone.ring }}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: "74%" }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>

      <motion.div style={chipStyle} className="absolute -right-3 -top-4 sm:-right-6" aria-hidden>
        <div className="rv-glass rv-float flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-acid" aria-hidden />
          Real on-page checks
        </div>
      </motion.div>
      <motion.div style={chipStyle} className="absolute -bottom-4 -left-3 sm:-left-6" aria-hidden>
        <div
          className="rv-glass rv-float flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-white shadow-lg"
          style={{ animationDelay: "-3s" }}
        >
          <SearchCheck className="h-4 w-4 text-acid" aria-hidden />
          Plain-language fixes
        </div>
      </motion.div>
      <motion.div style={chipStyle} className="absolute -bottom-5 right-6 hidden sm:block" aria-hidden>
        <div
          className="rv-glass rv-float flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-white shadow-lg"
          style={{ animationDelay: "-4.5s" }}
        >
          <Link2 className="h-4 w-4 text-acid" aria-hidden />
          Shareable reports
        </div>
      </motion.div>
    </div>
  );
}
