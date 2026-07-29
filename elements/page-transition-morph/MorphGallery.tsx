"use client";

/* SHARED-ELEMENT MORPH — click a tile and its cover morphs (Motion layoutId) into
   a full-screen detail card; close morphs it back. The active tile's image is
   hidden so it doesn't visually duplicate the morphing one. Reduced-motion →
   instant. Items + optional deep-link via props. (Craft element · page-transition-morph)

   Theme tokens it reads: bg-paper-2, bg-ink, text-paper, text-accent, text-muted,
   border-line + --font-display / --font-body / --font-mono. */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  eyebrow?: string; // small index/number
  meta?: string;    // e.g. "Editorial · 2025"
  blurb?: string;
};

export function MorphGallery({ items, detailHref }: { items: GalleryItem[]; detailHref?: (item: GalleryItem) => string }) {
  const [active, setActive] = useState<string | null>(null);
  const item = items.find((w) => w.id === active) || null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = active ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
        {items.map((w) => (
          <button key={w.id} onClick={() => setActive(w.id)} className="group block text-left" aria-label={`Open ${w.title}`}>
            <motion.div layoutId={`card-${w.id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-paper-2">
              <img
                src={w.src}
                alt={w.title}
                loading="lazy"
                decoding="async"
                style={{ opacity: active === w.id ? 0 : 1 }}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </motion.div>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
              <div className="flex items-baseline gap-3">
                {w.eyebrow && <span className="font-mono text-xs text-accent">{w.eyebrow}</span>}
                <h3 className="font-display text-2xl uppercase transition-colors group-hover:text-accent">{w.title}</h3>
              </div>
              {w.meta && <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{w.meta}</span>}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {item && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/95 p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-[1fr_0.55fr]" onClick={(e) => e.stopPropagation()}>
              <motion.div layoutId={`card-${item.id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-paper-2">
                <img src={item.src} alt={item.title} className="h-full w-full object-cover" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }} className="flex flex-col text-paper">
                <button onClick={() => setActive(null)} className="self-start font-mono text-xs uppercase tracking-[0.2em] text-paper/60 hover:text-accent">✕ Close</button>
                {item.eyebrow && <span className="mt-6 font-mono text-xs text-accent">{item.eyebrow}</span>}
                <h2 className="mt-1 font-display text-6xl uppercase leading-[0.9] md:text-7xl">{item.title}</h2>
                {item.meta && <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-paper/50">{item.meta}</p>}
                {item.blurb && <p className="mt-6 font-body leading-relaxed text-paper/80">{item.blurb}</p>}
                {detailHref && (
                  <a href={detailHref(item)} className="mt-8 inline-block self-start border border-paper/30 px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] hover:bg-accent hover:text-ink">
                    Open full page →
                  </a>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
