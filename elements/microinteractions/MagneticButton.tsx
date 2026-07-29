"use client";

/* STAGE 3 — Micro-interaction: magnetic button.
   The button (and its label, at half strength for parallax) eases toward the
   cursor while hovered, then springs back on leave. A small, memorable moment.
   Perf gate: transform only, GPU-composited. Reduced-motion → no magnet at all,
   it's a plain button. Keyboard-reachable (it's a real <a>); focus unaffected. */

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export function MagneticButton({
  children,
  href,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  href: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
    if (labelRef.current)
      labelRef.current.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
    if (labelRef.current) labelRef.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      <span ref={labelRef} className="inline-block transition-transform duration-300 ease-out">
        {children}
      </span>
    </a>
  );
}
