"use client";

/* HOVER IMAGE DISTORTION — an SVG feTurbulence + feDisplacementMap filter on the
   image; the displacement `scale` ramps up on hover and eases back (a liquid
   ripple), driven by rAF. Works on any <img>, GPU-composited, NO WebGL. Heavy-
   media safe: lazy + async-decode. Reduced-motion / touch → plain image, no
   filter. (Craft element · hover-image-distortion) */

import { useEffect, useId, useRef, useState } from "react";

export function RippleImage({
  src,
  fallback,
  alt,
  className = "",
  intensity = 20,
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  intensity?: number;
}) {
  const rawId = useId().replace(/[:]/g, "");
  const id = `ripple-${rawId}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const wrap = wrapRef.current;
    const disp = dispRef.current;
    if (!wrap || !disp) return;
    wrap.style.filter = `url(#${id})`;

    let target = 0;
    let cur = 0;
    let raf = 0;
    let running = false;

    const loop = () => {
      cur += (target - cur) * 0.12;
      disp.setAttribute("scale", cur.toFixed(2));
      if (target > 0 || cur > 0.15) {
        raf = requestAnimationFrame(loop);
      } else {
        disp.setAttribute("scale", "0");
        running = false;
      }
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const enter = () => { target = intensity; kick(); };
    const leave = () => { target = 0; kick(); };

    wrap.addEventListener("pointerenter", enter);
    wrap.addEventListener("pointerleave", leave);
    return () => {
      wrap.removeEventListener("pointerenter", enter);
      wrap.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
      wrap.style.filter = "";
    };
  }, [id, intensity]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (fallback && imgSrc !== fallback) setImgSrc(fallback);
        }}
        className="block h-full w-full object-cover"
      />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
