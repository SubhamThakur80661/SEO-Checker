import { motion, useReducedMotion } from "motion/react";

export function scoreTone(score) {
  if (score >= 80) return { ring: "#15803d", track: "#dcfce7", label: "In good shape" };
  if (score >= 50) return { ring: "#b45309", track: "#fef3c7", label: "Room to improve" };
  return { ring: "#b91c1c", track: "#fee2e2", label: "Needs work" };
}

/**
 * Animated SVG score ring, 0–100. Animates stroke offset on mount (skipped
 * under prefers-reduced-motion). tabular-nums for the score.
 */
export default function ScoreRing({ score = 0, size = 148, stroke = 11 }) {
  const reduceMotion = useReducedMotion();
  const tone = scoreTone(score);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`SEO score ${clamped} out of 100: ${tone.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tone.track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-display text-4xl font-bold leading-none text-ink">{clamped}</span>
        <span className="mt-1 text-xs font-medium text-muted">/ 100</span>
      </div>
    </div>
  );
}
