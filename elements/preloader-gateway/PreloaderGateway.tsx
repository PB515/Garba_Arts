"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/* ============================================================================
   PreloaderGateway — a cinematic entry: two door leaves part on scroll to reveal
   a backdrop scene + title behind them. Layered-PNG parallax (no WebGL — cheap on
   every device); degrades to "doors already open" for reduced-motion / no-JS.
   (Craft element · harvested from Hingulapuran's DoorHero · see
    IDP_Web/elements/preloader-gateway/recipe.md)

   CONTRACT  art + copy via props; reads the site theme tokens (raat/rakta/patra/swarna
   + --font-display / --font-display-latin).
   ========================================================================== */

export type GatewayConfig = {
  backdrop: { d: string; m: string }; // revealed scene — desktop wide / mobile tall
  leaf: { d: string; m: string };     // door leaf — desktop wide (object-cover) / mobile tall (object-contain)
  toran?: string;                     // optional foreground festoon image
  title: string;
  subtitle?: string;
  backdropAlt?: string;
  scrollCue?: string;                 // default "scroll to enter"
  heightVh?: number;                  // total scroll depth (default 450)
  openAt?: number;                    // fraction where the doors finish opening (default 0.4)
};

export function PreloaderGateway(cfg: GatewayConfig) {
  const { backdrop, leaf, toran, title, subtitle, backdropAlt = "", scrollCue = "scroll to enter", heightVh = 450, openAt = 0.4 } = cfg;

  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // doors part over the first ~openAt, then the open scene + title HOLD for the rest
  const leftX = useTransform(scrollYProgress, [0, openAt], ["0%", "-106%"]);
  const rightX = useTransform(scrollYProgress, [0, openAt], ["0%", "106%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const toranY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const open = !!reduce; // reduced-motion → start open, no scroll dependency

  return (
    <section ref={ref} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-raat">
        {/* backdrop — revealed behind the doors (desktop wide / mobile tall) */}
        <motion.img src={backdrop.d} alt={backdropAlt} style={{ scale: reduce ? 1 : bgScale }} className="absolute inset-0 hidden h-full w-full object-cover md:block" />
        <motion.img src={backdrop.m} alt="" aria-hidden style={{ scale: reduce ? 1 : bgScale }} className="absolute inset-0 h-full w-full object-cover md:hidden" />
        <div className="absolute inset-0 bg-raat/30" aria-hidden />

        {/* dark scrim behind the doors so the title reads against the bright cloth */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "radial-gradient(48% 42% at 50% 44%, rgba(18,16,31,0.94), rgba(18,16,31,0) 72%)" }} />

        {/* title — static behind the doors, revealed as they slide away */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-patra md:text-7xl" style={{ textShadow: "0 2px 24px rgba(18,16,31,.9)" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-7 max-w-2xl font-[family-name:var(--font-display)] text-xl leading-relaxed text-swarna md:text-3xl" style={{ textShadow: "0 2px 18px rgba(18,16,31,.95)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* door leaves (right = mirrored). DESKTOP: wide leaf, object-cover. */}
        <motion.img src={leaf.d} alt="" aria-hidden style={{ x: open ? "-106%" : leftX }}
          className="absolute left-0 top-0 z-30 hidden h-full w-1/2 bg-rakta object-cover object-right md:block" />
        <motion.img src={leaf.d} alt="" aria-hidden style={{ x: open ? "106%" : rightX, scaleX: -1 }}
          className="absolute right-0 top-0 z-30 hidden h-full w-1/2 bg-rakta object-cover object-right md:block" />
        {/* MOBILE: tall leaf, object-contain so the full art shows. */}
        <motion.img src={leaf.m} alt="" aria-hidden style={{ x: open ? "-106%" : leftX }}
          className="absolute left-0 top-0 z-30 h-full w-1/2 bg-rakta object-contain object-right md:hidden" />
        <motion.img src={leaf.m} alt="" aria-hidden style={{ x: open ? "106%" : rightX, scaleX: -1 }}
          className="absolute right-0 top-0 z-30 h-full w-1/2 bg-rakta object-contain object-right md:hidden" />

        {/* optional foreground festoon — DESKTOP tiled 3x / MOBILE single */}
        {toran && (
          <>
            <motion.div aria-hidden style={reduce ? undefined : { y: toranY }} className="absolute inset-x-0 top-0 z-40 hidden md:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toran} alt="" className="w-1/3" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toran} alt="" className="w-1/3" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toran} alt="" className="w-1/3" />
            </motion.div>
            <motion.img src={toran} alt="" aria-hidden style={reduce ? undefined : { y: toranY }} className="absolute inset-x-0 top-0 z-40 w-full md:hidden" />
          </>
        )}

        <div className="absolute inset-x-0 bottom-6 z-40 text-center font-[family-name:var(--font-display-latin)] text-xs uppercase tracking-[0.3em] text-patra/70">
          {scrollCue}
        </div>
      </div>
    </section>
  );
}
