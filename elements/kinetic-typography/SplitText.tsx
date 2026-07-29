"use client";

/* KINETIC TYPOGRAPHY (Tier A) — splits a line into chars or words and reveals
   them staggered (rise + slight rotate) when scrolled into view. Accessible:
   the whole string is announced via aria-label; the split units are aria-hidden.
   Reduced-motion → plain text. */

import { motion, useReducedMotion, type Variants } from "motion/react";

export function SplitText({
  text,
  className,
  by = "char",
  delay = 0,
  stagger = 0.03,
  y = 44,
}: {
  text: string;
  className?: string;
  by?: "char" | "word";
  delay?: number;
  stagger?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const units = by === "word" ? text.split(" ") : Array.from(text);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const item: Variants = {
    hidden: { y, opacity: 0, rotate: by === "char" ? -7 : 0 },
    show: { y: 0, opacity: 1, rotate: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      style={{ display: "inline-block" }}
      aria-label={text}
    >
      {units.map((u, i) => (
        <motion.span
          key={i}
          variants={item}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {by === "word" ? u + " " : u}
        </motion.span>
      ))}
    </motion.span>
  );
}
