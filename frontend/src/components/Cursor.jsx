import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "../lib/motion";

function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer()) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const reduced = prefersReducedMotion();
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: reduced ? 0.08 : 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: reduced ? 0.08 : 0.45, ease: "power3.out" });

    const onMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e) => {
      const target = e.target.closest("a, button, input, [data-cursor]");
      gsap.to(ring, {
        scale: target ? 1.9 : 1,
        opacity: target ? 0.9 : 0.55,
        duration: 0.3,
        ease: "power3.out",
      });
      gsap.to(dot, { scale: target ? 0.5 : 1, duration: 0.3, ease: "power3.out" });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-9 w-9 rounded-full border border-lime/70 opacity-55"
      />
      <div ref={dotRef} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-lime" />
    </div>
  );
}

export default Cursor;
