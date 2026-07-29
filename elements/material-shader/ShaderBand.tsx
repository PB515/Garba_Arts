"use client";

/* Wrapper — makes the shader shippable, same rules as the R3F hero: ssr:false +
   lazy import, IntersectionObserver gates the mount, and a static CSS-gradient
   fallback for weak devices (the shader bundle never downloads there). The static
   gradient + legibility veil are derived from the shader colours, so the element
   is self-contained (no site-token dependency). (Craft element · material-shader) */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { type ShaderColors, DEFAULT_SHADER_COLORS } from "./material-config";

const ShaderScene = dynamic(() => import("./ShaderScene"), { ssr: false });

export function ShaderBand({ children, colors, veil = 0.4 }: { children: ReactNode; colors?: Partial<ShaderColors>; veil?: number }) {
  const merged: ShaderColors = { ...DEFAULT_SHADER_COLORS, ...colors };
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    if (cores <= 4 || mem <= 4) setLite(true);
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
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showShader = inView && !lite;
  const veilHex = Math.round(Math.min(1, Math.max(0, veil)) * 255).toString(16).padStart(2, "0");

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* shader (or static gradient) fills the band */}
      <div className="absolute inset-0 -z-10" aria-hidden style={{ background: `linear-gradient(120deg, ${merged.a}, ${merged.b} 60%, ${merged.a})` }}>
        {showShader && (
          <div className="h-full w-full">
            <ShaderScene colors={merged} />
          </div>
        )}
      </div>
      {/* legibility veil over the moving surface */}
      <div className="absolute inset-0 -z-10" aria-hidden style={{ background: `${merged.a}${veilHex}` }} />
      {children}
    </section>
  );
}
