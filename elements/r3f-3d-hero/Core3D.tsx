"use client";

/* Shippable wrapper for the neural core (the recipe pattern):
   dynamic ssr:false + IntersectionObserver mount + weak-device static fallback.
   Colours via props (default = command-center cyan/violet). (Craft element · r3f-3d-hero) */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { type CoreColors, DEFAULT_CORE_COLORS } from "./core-config";

const CoreScene = dynamic(() => import("./CoreScene"), { ssr: false });

function StaticCore({ colors }: { colors: CoreColors }) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: `1px solid ${colors.ringA}80`, boxShadow: `0 0 60px ${colors.core}59` }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: `1px solid ${colors.ringB}4d` }}
      />
    </div>
  );
}

export function Core3D({
  pointerCam = false,
  colors,
  particleCount,
}: {
  pointerCam?: boolean;
  colors?: Partial<CoreColors>;
  particleCount?: number;
}) {
  const merged: CoreColors = { ...DEFAULT_CORE_COLORS, ...colors };
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    // Only fall back on genuinely weak devices (both signals low).
    if (cores <= 4 && mem <= 4) setLite(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {inView && !lite ? <CoreScene pointerCam={pointerCam} colors={merged} particleCount={particleCount} /> : <StaticCore colors={merged} />}
    </div>
  );
}
