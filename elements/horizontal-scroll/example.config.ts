import type { HorizontalScrollConfig } from "./HorizontalScroll";

/* The history of Hingul as data for the HorizontalScroll element. */
export const hingulLegend: HorizontalScrollConfig = {
  panels: [
    { src: "/art/legend/a-tapasya.webp", cap: "The penance of Hingul" },
    { src: "/art/legend/b-conquest.webp", cap: "The conquest of the heavens" },
    { src: "/art/legend/c-vow.webp", cap: "The vow of the Devi" },
    { src: "/art/legend/d-light.webp", cap: "The unprecedented light" },
    { src: "/art/legend/e-vardan.webp", cap: "The boon — Hinglaj" },
  ],
  kicker: "The history",
  title: "हिंगुल का इतिहास",
  scrollCue: "scroll — the festival moves past you",
  heightVh: 900,
  clothTexture: "/art/motifs/cloth-texture.webp",
};
