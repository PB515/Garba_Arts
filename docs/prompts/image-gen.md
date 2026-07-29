# Prompt — Image Prompt Generator (Universal) · v2.1

*Toolkit prompt · feeds SOP Step 4 · turns your 06b + design doc into ready-to-paste image prompts*
*This does NOT generate images. It generates the PROMPTS — one per image FILE, instance-level, aspect-locked, each labeled with its target filename — that you paste into your image tool.*

---

## How to use

1. Have ready: your project's **Image & Asset Plan (06b)**, **Design System (04)**, and **Site Map & Page Layouts (03b)** — 03b is the authoritative page list the image count is built from.
2. Pick your image tool and grab its aspect-ratio syntax from the table below.
3. Paste the prompt below + your 06b + your 04 into a capable AI.
4. It returns, for **every image instance**, a `FILE:` target name + the prompt. You generate each, then save it *as the stated filename* — no renaming later.

You decide which slots to generate, shoot, or skip — this produces the prompt for each, with the aspect ratio locked, the target filename attached, in your house style.

**Two things this version fixes (v2.1 of this prompt):**
- **Filename-labeled output.** Image tools can't name their own downloads, so the rename step used to be manual and error-prone. Now every prompt is emitted with its exact target `FILE:` path — you save each image correctly the first time, straight into its folder, no `_incoming`/rename dance.
- **Instance-level, not category-level.** A "service hero" isn't one image — it's one per service page. This version expands every repeated page (services, posts, team, cards) into its real instances and writes one prompt per instance, so nothing is undercounted.

---

## THE PROMPT (copy from here)

```
You are an art director writing image-generation prompts. I will give you these
documents from my website project:
  (A) the Image & Asset Plan (06b) — lists every image slot, its type (photo /
      icon / illustration / none), and where it goes.
  (B) the Design System (04) — the palette, vibe, and style of the site.
  (C) the Site Map & Page Layouts (03b) — the authoritative list of every page
      the site has (services, posts, team, etc.), enumerated.

Your job: produce a ready-to-paste image-generation prompt for EVERY image FILE
the site needs. Do this:

1. First, derive a HOUSE STYLE block from (B): the exact palette (with hex
   codes), the mood/vibe in plain words, the lighting, and what to avoid
   (clichés, wrong aesthetics). Every per-image prompt must inherit this so all
   images form one coherent family.

2. ENUMERATE BY INSTANCE, not by category, using (C) as the source of truth for
   how many pages exist. A slot like "service page hero" is NOT one image — it's
   one per service page in (C). Walk (C)'s page list and expand every repeated
   slot in (A) into its real instances (each service page, each segment card,
   each service card, each team member, each post). Count the true number of
   FILES. (C) is authoritative — if (A) and (C) disagree on page count, trust (C)
   and flag the mismatch.

3. For each image instance that is a photo or illustration, write a prompt that
   includes:
   - the house style,
   - the specific subject/concept for THAT instance (e.g. the GST hero differs
     from the Audit hero — give each a distinct concept),
   - "photo-real / natural documentary photograph" for people & places,
     "soft minimal flat 2D illustration" for concepts (or as (A) specifies),
   - NO text inside the image (text is added in code later),
   - the ASPECT RATIO, stated using THIS exact syntax for my tool:
        [PASTE YOUR TOOL'S RATIO SYNTAX FROM THE TABLE — see below]
     stated at BOTH the start and end of the prompt, with an explicit
     "do not output square, do not crop" instruction.

4. OUTPUT FORMAT — for every image, emit a block exactly like this so I can save
   each download with the right name immediately (image tools can't name their
   own files, so the filename must travel with the prompt):

   FILE: [exact target path + filename, e.g. service-heroes/hero-gst.png]
   RATIO: [e.g. 16:9]
   PROMPT:
   [the full prompt, house style included, ratio at start and end]

   Group the blocks by folder. At the top, give me a COUNT: total number of image
   files, broken down by group.

5. For slots marked icon / none / logo-as-vector / labelled-diagram in (A): do
   NOT write a generation prompt. List them under "SKIPPED" with one line each on
   why (icons stay icons; a logo must be true vector; labelled diagrams should be
   coded so text stays crisp).

Critical:
- Aspect ratio is the most-ignored instruction in image tools — make it loud,
  exact, repeated, in the correct syntax for my tool.
- The FILE name must match the folder structure in (A) exactly, lowercase with
  hyphens, so I save straight into place with no renaming.
- Distinct concepts per instance — don't write the same prompt seven times for
  seven service heroes.

Here are my documents:
--- (A) IMAGE & ASSET PLAN (06b) ---
[paste 06b]
--- (B) DESIGN SYSTEM (04) ---
[paste 04]
--- (C) SITE MAP & PAGE LAYOUTS (03b) ---
[paste 03b]
```

---

## Aspect-ratio syntax per tool (the only real platform difference)

Paste the right line into the prompt above where it says `[PASTE YOUR TOOL'S RATIO SYNTAX]`:

| Tool | How to express ratio | Example (16:9) |
|---|---|---|
| **Gemini / Imagen** | In words, repeated; no flags | `"wide 16:9 landscape — do not output square or vertical, do not crop"` |
| **ChatGPT / DALL·E** | In words + size hint; respects "landscape/portrait/square" | `"landscape 16:9, 1792x1024, wide composition, not square"` |
| **Midjourney** | Parameter flag at end of prompt | `--ar 16:9` |

Common ratios you'll need (from 06b): 16:9 (hero, banners, blog headers), 1.91:1 / 1200×630 (OG/social), 4:5 (portraits/headshots), 1:1 (square visuals), 3:1 (thin service banners).

---

## Workflow after you get the prompts

```
1. Read the COUNT at the top — know how many files you're committing to before you start
2. Generate the images in ONE sitting per group (consistency: same session = same style)
3. For each: generate 3–4 VARIANTS (tools drift on colour — you select, not accept)
4. Pick the best palette match; if colour is off, re-add the hex codes + "muted, warm, desaturated"
5. Confirm the aspect ratio is correct BEFORE accepting (never crop square → wide)
6. SAVE each download AS THE FILE: name given — straight into its folder, no renaming
7. Compress (Squoosh / TinyPNG) — keep the same filename
8. Consistency check per group: lay all (e.g. 7 service heroes) side by side — any odd one out, regenerate
9. The agent then wires them via next/image with alt text (you don't place them by hand)
```

The `FILE:` label is what removes the old rename step: you save correctly the first time, so the agent just wires what's already correctly named and placed.

---

## GATE

```
[ ] Output gives a total COUNT, broken down by group (instances, not categories)
[ ] Every photo/illustration INSTANCE has its own prompt (7 service heroes = 7 prompts)
[ ] Every prompt carries a FILE: target path matching 06b's folder structure exactly
[ ] Every prompt carries the same house style (one coherent family)
[ ] Distinct concept per instance (heroes aren't all identical prompts)
[ ] Aspect ratio stated loudly, in the correct syntax for my tool
[ ] Icon / vector-logo / labelled-diagram slots correctly SKIPPED (with reason)
```

*One generator prompt. Platform-specific part = the ratio syntax line (a 3-row lookup). The FILE: labels mean save-once-correctly, no rename. Instance-level enumeration means honest counts. One source of truth.*
