import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * CountUp — animates 0 -> value over ~0.9s on mount. Renders the plain
 * number under prefers-reduced-motion, and passes non-numeric values
 * (like "—" or "…") through untouched.
 */
export function CountUp({ value, className = "" }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const mv = useMotionValue(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = String(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  if (typeof value !== "number") return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {reduceMotion ? value : 0}
    </span>
  );
}

/**
 * TiltCard — 3D tilt-on-hover: the card follows the cursor with spring
 * physics (max tilt ~7deg) and lifts slightly. Disabled under
 * prefers-reduced-motion.
 */
export function TiltCard({ children, className = "", max = 7 }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 300, damping: 20 });

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

  return (
    <div className="rv-tilt-scene h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        whileHover={reduceMotion ? undefined : { y: -4 }}
        className={`rv-tilt-card h-full ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Reveal — staggered entrance wrapper: fade + rise with a per-item delay.
 * Renders instantly under prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, y = 14, className = "" }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
