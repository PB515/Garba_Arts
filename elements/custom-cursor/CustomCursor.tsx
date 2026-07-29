"use client";

/* CUSTOM CURSOR (Tier A) — vermilion dot follows precisely, gold ring trails
   with a lerp, ring grows on interactive hover. Managed entirely in JS:
   only activates on fine-pointer devices, hides the native cursor itself, and
   does NOTHING on touch / no-JS (native cursor stays). Reduced-motion → ring
   tracks instantly (no trail). */

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return; // touch → keep native cursor, render nothing functional
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.style.cursor = "none";

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let shown = false;

    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      place(dot, tx, ty);
      if (reduce) place(ring, tx, ty);
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
        ring.style.opacity = "0.75";
      }
    };
    window.addEventListener("pointermove", onMove);

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement)?.closest?.("a, button, [data-cursor]");
      ring.classList.toggle("cursor-hover", !!t);
    };
    document.addEventListener("pointerover", onOver);

    let raf = 0;
    const loop = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      place(ring, rx, ry);
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cc-dot" aria-hidden />
      <div ref={ringRef} className="cc-ring" aria-hidden />
    </>
  );
}
