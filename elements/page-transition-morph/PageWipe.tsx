"use client";

/* PAGE-TRANSITION WIPE — drop inside app/template.tsx (which re-mounts per route),
   so this plays on every navigation: a solid panel covers the screen then retracts
   upward, with a thin accent bar. Reduced-motion → nothing. Colours via classes.
   (Craft element · page-transition-morph) */

import { motion, useReducedMotion } from "motion/react";

export function PageWipe({ panelClassName = "bg-ink", barClassName = "bg-accent" }: { panelClassName?: string; barClassName?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <>
      <motion.div
        className={`pointer-events-none fixed inset-0 z-[90] origin-top ${panelClassName}`}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[91] h-1 origin-left ${barClassName}`}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
    </>
  );
}
