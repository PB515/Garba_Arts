/* ambient-motifs · example usage
   The field has a baked default motif set + slots, so the minimum is just an
   <AmbientMotifs /> as the first child of a positioned, overflow-hidden section
   with the content lifted to relative z-10. Give each section a distinct offset. */

import { AmbientMotifs } from "@/components/AmbientMotifs";

// --- minimal: defaults (devotional kalam motifs, gold), one section ---
export function MediaSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-[#1a0f12]">
      <AmbientMotifs offset={0} />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center">
        {/* the pinned media / centred block goes here */}
      </div>
    </section>
  );
}

// --- per-section variation: same field, different offset so neighbours differ ---
//   <ScrollVideo>     → <AmbientMotifs offset={0} />
//   <PothiScroll>     → <AmbientMotifs offset={1} />
//   <BrahmarandhraOrb>→ <AmbientMotifs offset={2} />
//   <CutReel>         → <AmbientMotifs offset={3} />

// --- custom brand motifs + colour (any stroke-only SVG in a 0 0 100 100 box) ---
const star = <path d="M50 12 61 40 90 40 66 58 75 88 50 70 25 88 34 58 10 40 39 40Z" strokeLinejoin="round" />;
const ring = <circle cx="50" cy="50" r="34" />;

export function BrandSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-32" style={{ perspective: 1000 }}>
      <AmbientMotifs motifs={[star, ring]} color="var(--brand-accent, #7c5cff)" count={4} shift={20} offset={2} />
      <div className="relative z-10 mx-auto max-w-5xl text-center">{/* content */}</div>
    </section>
  );
}
