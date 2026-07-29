# Elements — the craft component library

The **runnable** half of the craft layer. `craft-lab/recipes/*` is the *theory* (how a
technique works); this is the *proven, parameterized component* you drop into a site.

> **Not a skill.** Per the skills Charter §8 ("most gaps want a pattern, not a skill"),
> this is a **pattern + registry**, consumed by the existing `frontend-design` / `motion`
> skills and the build agent — not a fourth skill.

## How it's invoked (the pattern)

The user names an element + version and the target:

> *"add `cinematic-scroll-saga` v1 to the Hingul chapter with these images"*

The build agent then:
1. Looks it up in [`registry.json`](registry.json) → gets the component file, config schema, deps, asset slots.
2. Copies the component into the site's `components/`.
3. Scaffolds its **data file** from the schema and wires the site's **images** into the asset slots.
4. Installs deps, builds, **verifies** (per the build discipline below).

→ **Full step-by-step in [`ADD-ELEMENT.md`](ADD-ELEMENT.md)** (the consumption playbook + a quick map of every element).

## What makes an element library-grade (the contract)

An element enters the registry as `status: proven` **only** when it is:
- **Self-contained** — one component (+ optional `lib/` util); no page-specific imports.
- **Token-driven** — reads the site theme; **no hardcoded brand colours**.
- **Data + assets via props** — `scenes[]`, `beats[]`, image slots; nothing about one client baked in.
- **Versioned** — `v1, v2, v3` are *frozen variants*, never edits. A new behaviour = a new version.
- **Proven** — it shipped on a real site and works end-to-end.

## Build discipline (how each element is harvested / built)

One layer at a time, verify after each — **never all at once** (this is the lesson that cost a day):

1. **Static** — renders, framed, right size, full brightness.
2. **Pacing** — scroll windows / weights / which beat is active.
3. **Motion** — fades, reveals, transitions.
4. **Polish** — colours, markers, vignettes.

Debug by **subtraction**: strip to the simplest thing that works, add back ONE layer, re-check.
"My edit had no visible effect" = a pipeline bug (stale server / cache), not the code — fix the loop.

## Status legend (in registry.json)
- `proven` — library-grade, ready to drop in.
- `todo` — built & shipped on a source site, **not yet generalized** into the registry.
- `superseded` — replaced by a better version (kept for reference / git history).
- `parked` — built but set aside (e.g. a demo not adopted).

## Status — library complete (2026-06-19)
**12 elements proven, 0 todo.** Harvested one at a time, each generalized → dogfooded on its source
site → frozen here (the 3D / GLSL / routing ones build-verified in their repos):

`cinematic-scroll-saga` · `preloader-gateway` · `horizontal-scroll` · `r3f-3d-hero` · `material-shader` ·
`hover-image-distortion` · `page-transition-morph` · `kinetic-typography` · `reveal` · `custom-cursor` ·
`smooth-scroll` · `microinteractions`. (`scene-reel-2.5d`, `entrance-choreography`, `cylinder-carousel`
are superseded/parked — see registry.)

New bricks follow the same harvest discipline; add them as `proven` only once shipped + generalized.
