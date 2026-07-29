"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/* ============================================================================
   HorizontalScroll — a row of panels that scrolls sideways while the section is
   pinned. Panel widths come from aspect-ratio (not image load), so the track width
   is deterministic — no cold-load measurement bug. Reduced-motion → vertical stack.
   (Craft element · harvested from Hingulapuran's LegendScroll · see
    IDP_Web/elements/horizontal-scroll/recipe.md)

   CONTRACT  panels + copy via props; reads site theme tokens (raat/rakta/patra/swarna/
   muted/border + --font-display / --font-display-latin / --font-body / --radius).
   ========================================================================== */

export type HorizontalScrollConfig = {
  panels: { src: string; cap: string }[];
  title?: string;
  kicker?: string;
  scrollCue?: string;          // default "scroll"
  heightVh?: number;           // total scroll depth (default = panels.length * 180)
  clothTexture?: string;       // optional tiled background texture
  panelAspect?: string;        // default "8 / 3"
  panelHeight?: string;        // default "60vh"
};

export function HorizontalScroll(cfg: HorizontalScrollConfig) {
  const {
    panels, title, kicker, scrollCue = "scroll",
    heightVh = panels.length * 180, clothTexture,
    panelAspect = "8 / 3", panelHeight = "60vh",
  } = cfg;

  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useLayoutEffect(() => {
    const measure = () => {
      if (trackRef.current) setDist(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (reduce) {
    return (
      <section className="bg-raat px-6 py-20">
        {title && <h2 className="mb-10 text-center font-[family-name:var(--font-display)] text-4xl text-patra">{title}</h2>}
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {panels.map((p) => (
            <figure key={p.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.cap} className="w-full rounded-[var(--radius)] border border-border" />
              <figcaption className="mt-2 text-center font-[family-name:var(--font-body)] text-sm text-muted">{p.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative bg-rakta"
      style={{ height: `${heightVh}vh`, ...(clothTexture ? { backgroundImage: `url(${clothTexture})`, backgroundSize: "640px" } : {}) }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {(kicker || title) && (
          <div className="pointer-events-none absolute left-0 right-0 top-24 z-10 text-center">
            {kicker && <p className="font-[family-name:var(--font-display-latin)] text-xs uppercase tracking-[0.35em] text-swarna">{kicker}</p>}
            {title && <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-patra md:text-5xl">{title}</h2>}
          </div>
        )}

        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-center gap-[4vw] px-[6vw] will-change-transform">
          {panels.map((p, i) => (
            <figure
              key={p.src}
              className="relative shrink-0 overflow-hidden rounded-md border-2 border-swarna/30 shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
              style={{ height: panelHeight, aspectRatio: panelAspect }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.cap} loading="eager" className="h-full w-full object-cover" />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4 text-left font-[family-name:var(--font-display-latin)] text-sm tracking-[0.15em] text-patra">
                <span className="text-swarna">{String(i + 1).padStart(2, "0")}</span> · {p.cap}
              </figcaption>
            </figure>
          ))}
        </motion.div>

        <div className="absolute inset-x-0 bottom-8 text-center font-[family-name:var(--font-display-latin)] text-xs uppercase tracking-[0.3em] text-patra/60">
          {scrollCue}
        </div>
      </div>
    </section>
  );
}
