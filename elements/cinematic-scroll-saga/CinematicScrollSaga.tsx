"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent, type MotionValue } from "motion/react";
import { buildTimeline } from "./timeline";

/* ============================================================================
   CinematicScrollSaga — a chapter as ONE pinned, two-column stage.
   (Craft element · harvested from Hingulapuran's ShaktipeethSaga · see
    IDP_Web/elements/cinematic-scroll-saga/recipe.md)

   LAYOUT   left = text panel (all titles/descriptions) · right = artwork only.
   SEQUENCE one scroll, one weighted timeline:
     1. REEL   — 2.5D layered scenes (far/subject/near, emerge + parallax), hard-swapped.
     2. MAP    — a painted map revealed; beats light up site markers in turn.
     3. FINALE — holds on the last beat; if `finalePhoto` is set, closes on that photo.

   CONTRACT  data + assets via props; marker colours are props; everything else reads the
   site theme tokens (patra/swarna/raat/muted/border + --font-display/--font-body/--radius).
   ========================================================================== */

export type SagaLayer = { d: string; m: string }; // desktop / mobile image
export type SagaScene = {
  far: SagaLayer; subject: SagaLayer; near: SagaLayer; deva: string; en: string;
  subjectScale?: number; nearScale?: number; nearAlign?: "bottom" | "center";
  overlay?: { src: SagaLayer; scale?: number; spin?: number };
};
export type SagaBeat = { deva: string; en: string; body: string; all?: boolean; x?: number; y?: number; hinglaj?: boolean };

export type CinematicSagaConfig = {
  scenes: SagaScene[];
  mapImage: string;
  beats: SagaBeat[];
  peethas?: { x: number; y: number }[]; // scattered markers lit on the `all` beat
  finalePhoto?: string | null;
  finaleText?: { deva: string; en: string; body: string };
  // pacing
  sceneWeights?: number[];
  sceneWeight?: number;
  beatWeight?: number;
  finaleWeight?: number;
  vhPerUnit?: number;
  // marker colours (6-digit hex)
  markerColor?: string;
  beaconCore?: string;
  beaconGlow?: string;
  beaconHalo?: string;
};

/** opacity for a scroll window. `first` = visible from the very start; `hold` = stays to the end. */
function useWindow(p: MotionValue<number>, a: number, b: number, opts?: { fade?: number; hold?: boolean; first?: boolean }) {
  const fade = opts?.fade ?? 0.2;
  const f = (b - a) * fade;
  let stops: number[];
  let out: number[];
  if (opts?.first) { stops = [a, b - f, b]; out = [1, 1, 0]; }
  else if (opts?.hold) { stops = [a, a + f, 1]; out = [0, 1, 1]; }
  else { stops = [a, a + f, b - f, b]; out = [0, 1, 1, 0]; }
  return useTransform(p, stops, out);
}

function Img({ src, y, fit, z, scale, origin }: { src: SagaLayer; y: MotionValue<string>; fit: string; z: string; scale?: number; origin?: string }) {
  const cls = `pointer-events-none absolute inset-0 h-full w-full ${fit} ${z}`;
  const style = { y, scale, transformOrigin: origin };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={src.d} alt="" aria-hidden loading="lazy" style={style} className={`hidden md:block ${cls}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={src.m} alt="" aria-hidden loading="lazy" style={style} className={`md:hidden ${cls}`} />
    </>
  );
}

/** one reel scene (artwork only). Only the active scene is ever mounted — no cross-fade. */
function Scene({ scene, a, b, p }: { scene: SagaScene; a: number; b: number; p: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const scale = useTransform(p, [a, (a + b) / 2, b], [0.94, 1, 1.06]);
  const farY = useTransform(p, [a, b], ["-2%", "2%"]);
  const subjY = useTransform(p, [a, b], ["-6%", "6%"]);
  const nearY = useTransform(p, [a, b], ["-12%", "12%"]);

  const subjScale = scene.subjectScale ?? 1;
  const nearScale = scene.nearScale ?? 1;
  const nearFit = scene.nearAlign === "bottom" ? "object-contain object-bottom" : "object-contain";
  const nearOrigin = scene.nearAlign === "bottom" ? "center bottom" : undefined;
  const ov = scene.overlay;

  return (
    <motion.div style={{ scale }} className="absolute inset-0 isolate will-change-transform">
      <Img src={scene.far} y={farY} fit="object-cover" z="z-0" />
      <div className="pointer-events-none absolute inset-0 z-[5] bg-raat/20" />
      <Img src={scene.subject} y={subjY} fit="object-contain" z="z-10" scale={subjScale} origin="center bottom" />
      <Img src={scene.near} y={nearY} fit={nearFit} z="z-20" scale={nearScale} origin={nearOrigin} />
      {ov && (
        <div className="pointer-events-none absolute inset-0 z-[24] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img src={ov.src.d} alt="" aria-hidden style={{ width: `${(ov.scale ?? 0.34) * 100}%` }} className="hidden md:block"
            animate={reduce || !ov.spin ? undefined : { rotate: 360 }} transition={ov.spin ? { duration: ov.spin, repeat: Infinity, ease: "linear" } : undefined} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img src={ov.src.m} alt="" aria-hidden style={{ width: `${(ov.scale ?? 0.34) * 100}%` }} className="md:hidden"
            animate={reduce || !ov.spin ? undefined : { rotate: 360 }} transition={ov.spin ? { duration: ov.spin, repeat: Infinity, ease: "linear" } : undefined} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-[26]" style={{ background: "radial-gradient(125% 110% at 50% 45%, transparent 62%, rgba(18,16,31,.4) 100%)" }} />
    </motion.div>
  );
}

function PeethaDot({ site, a, b, p, color }: { site: { x: number; y: number }; a: number; b: number; p: MotionValue<number>; color: string }) {
  const glow = useWindow(p, a, b);
  return (
    <span style={{ left: `${site.x}%`, top: `${site.y}%` }} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2">
      <span className="block h-1.5 w-1.5 rounded-full" style={{ background: color, opacity: 0.4 }} />
      <motion.span style={{ opacity: glow, background: color, boxShadow: `0 0 10px 2px ${color}a6` }} className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </span>
  );
}

/** a glowing site marker on the map (no label — the title is in the left panel). */
function FocusPin({ stop, a, b, p, marker, beaconCore, beaconGlow, beaconHalo }: { stop: SagaBeat; a: number; b: number; p: MotionValue<number>; marker: string; beaconCore: string; beaconGlow: string; beaconHalo: string }) {
  const opacity = useWindow(p, a, b);
  const isH = stop.hinglaj;
  return (
    <motion.div style={{ left: `${stop.x}%`, top: `${stop.y}%`, opacity }} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2">
      <span className="relative flex items-center justify-center">
        <motion.span animate={{ scale: [1, 2, 1], opacity: [0.55, 0, 0.55] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute rounded-full ${isH ? "h-9 w-9" : "h-7 w-7"}`} style={{ background: `${isH ? beaconHalo : marker}8c` }} />
        <span className={`relative rounded-full ${isH ? "h-4 w-4" : "h-3 w-3"}`}
          style={isH
            ? { background: beaconCore, boxShadow: `0 0 16px 5px ${beaconGlow}cc, 0 0 0 4px ${beaconGlow}66` }
            : { background: marker, boxShadow: `0 0 10px 2px ${marker}a6, 0 0 0 4px ${marker}4d` }} />
      </span>
    </motion.div>
  );
}

export function CinematicScrollSaga(cfg: CinematicSagaConfig) {
  const {
    scenes, mapImage, beats, peethas = [], finalePhoto = null, finaleText,
    sceneWeights, sceneWeight = 1.4, beatWeight = 1.8, finaleWeight = 1.4, vhPerUnit = 150,
    markerColor = "#FF4D3A", beaconCore = "#ffffff", beaconGlow = "#FFD23F", beaconHalo = "#FFE08A",
  } = cfg;

  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const S = scenes.length;
  const B = beats.length;
  const OVERVIEW = beats.findIndex((s) => s.all);
  const hasPhoto = !!finalePhoto;
  const weights = [
    ...scenes.map((_, i) => sceneWeights?.[i] ?? sceneWeight),
    ...beats.map(() => beatWeight),
    ...(hasPhoto ? [finaleWeight] : []),
  ];
  const { heightVh, windows } = buildTimeline(weights, vhPerUnit);
  const sceneWindows = windows.slice(0, S);
  const beatWindows = windows.slice(S, S + B);
  const finaleWindow = hasPhoto ? windows[S + B] : null;
  const scrollHint = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let idx = 0;
    for (let i = 0; i < windows.length; i++) if (v >= windows[i][0]) idx = i;
    setActive(idx);
  });

  const textItems = [
    ...scenes.map((s, i) => ({ key: `s${i}`, win: sceneWindows[i], deva: s.deva, en: s.en, body: undefined as string | undefined })),
    ...beats.map((s, k) => ({ key: `b${k}`, win: beatWindows[k], deva: s.deva, en: s.en, body: s.body as string | undefined })),
    ...(hasPhoto && finaleWindow && finaleText ? [{ key: "fin", win: finaleWindow, deva: finaleText.deva, en: finaleText.en, body: finaleText.body as string | undefined }] : []),
  ];

  if (reduce) {
    return (
      <section className="bg-raat px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {scenes.map((s, i) => (
            <figure key={`s${i}`} className="relative aspect-video overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-swarna/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.far.d} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-raat/25" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.subject.d} alt={s.en} className="absolute inset-0 h-full w-full object-contain" />
              <figcaption className="absolute inset-x-0 bottom-4 text-center font-[family-name:var(--font-display)] text-2xl text-patra">{s.deva}</figcaption>
            </figure>
          ))}
          <figure className="relative aspect-video overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-swarna/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={finalePhoto ?? mapImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-raat/25" />
          </figure>
          <ol className="space-y-6">
            {beats.map((s) => (
              <li key={s.en}>
                <p className="font-[family-name:var(--font-display)] text-2xl text-patra">{s.deva}</p>
                <p className="mt-1 font-[family-name:var(--font-display-latin)] text-[11px] uppercase tracking-[0.26em] text-swarna">{s.en}</p>
                <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative bg-raat" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-10">
        <div className="mx-auto grid w-full max-w-7xl items-stretch gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
          {/* LEFT — text panel (one item at a time, hard swap, no overlap) */}
          <div className="flex min-h-[24vh] flex-col justify-center md:min-h-0">
            <div key={textItems[active]?.key} className="flex flex-col justify-center">
              <p className="font-[family-name:var(--font-display)] text-4xl leading-tight text-patra md:text-5xl">{textItems[active]?.deva}</p>
              <p className="mt-2 font-[family-name:var(--font-display-latin)] text-[11px] uppercase tracking-[0.26em] text-swarna">{textItems[active]?.en}</p>
              {textItems[active]?.body && (
                <p className="mt-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-muted md:text-base">{textItems[active]?.body}</p>
              )}
            </div>
          </div>

          {/* RIGHT — artwork only */}
          <div className="relative aspect-video w-full overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-swarna/25 shadow-[0_40px_140px_rgba(0,0,0,.65)]">
            {/* MAP — always present, a plain bright image at the back */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapImage} alt="" aria-hidden className="absolute inset-0 z-0 h-full w-full object-cover" />

            {/* MAP MARKERS — only during the map beats */}
            {active >= S && active < S + B && (
              <div className="absolute inset-0 z-[15]">
                {peethas.map((s, k) => {
                  const [a, b] = beatWindows[OVERVIEW >= 0 ? OVERVIEW : 0];
                  return <PeethaDot key={`pd${k}`} site={s} a={a} b={b} p={scrollYProgress} color={markerColor} />;
                })}
                {beats.map((s, k) => {
                  if (s.x == null) return null;
                  const [a, b] = beatWindows[k];
                  return <FocusPin key={`fp${k}`} stop={s} a={a} b={b} p={scrollYProgress} marker={markerColor} beaconCore={beaconCore} beaconGlow={beaconGlow} beaconHalo={beaconHalo} />;
                })}
              </div>
            )}

            {/* REEL — the active scene covers the map */}
            {active < S && (
              <div className="absolute inset-0 z-10">
                <Scene key={`sc${active}`} scene={scenes[active]} a={sceneWindows[active][0]} b={sceneWindows[active][1]} p={scrollYProgress} />
              </div>
            )}

            {/* FINALE — close on the photo (only if provided) */}
            {hasPhoto && active >= S + B && (
              <div className="absolute inset-0 z-30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={finalePhoto!} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] ring-1 ring-inset ring-swarna/15" />
            <motion.div style={{ opacity: scrollHint }} className="absolute inset-x-0 bottom-3 z-40 text-center font-[family-name:var(--font-display-latin)] text-[11px] uppercase tracking-[0.3em] text-patra/45">
              scroll
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
