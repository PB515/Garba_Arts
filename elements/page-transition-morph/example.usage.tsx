"use client";

/* The work gallery = the generic MorphGallery fed the WORK data.
   (Element harvested into IDP_Web/elements/page-transition-morph.) */

import { MorphGallery, type GalleryItem } from "@/components/MorphGallery";
import { WORK } from "<your-items-source>";

const items: GalleryItem[] = WORK.map((w) => ({
  id: w.slug,
  src: w.src,
  title: w.title,
  eyebrow: w.n,
  meta: `${w.cat} · ${w.year}`,
  blurb: w.blurb,
}));

export function WorkGallery() {
  return <MorphGallery items={items} detailHref={(it) => `/work/${it.id}`} />;
}
