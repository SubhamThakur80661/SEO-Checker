import { useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "../lib/motion";

function Magnetic({ children, strength = 6, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el, {
      x: (dx / rect.width) * strength,
      y: (dy / rect.height) * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </div>
  );
}

export default Magnetic;
