"use client";

/* Reveal-on-scroll — reduced-motion-aware whileInView (from the recipe).
   opacity + transform only; static render when reduced-motion. */

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EXPO = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
