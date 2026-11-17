import gsap from "gsap";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;

export function revealLines(scope, selector = ".mask-line > span") {
  if (prefersReducedMotion()) return null;
  return gsap.fromTo(
    scope.querySelectorAll(selector),
    { yPercent: 110 },
    { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.09 }
  );
}

export function fadeUp(scope, selector, delay = 0) {
  if (prefersReducedMotion()) return null;
  return gsap.fromTo(
    scope.querySelectorAll(selector),
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay }
  );
}

export { gsap };
