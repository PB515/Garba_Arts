# Elements Showcase — scope (the client-facing twin of the registry)

*Status: **scoped, not built.** This is the plan; build it as a focused slice when ready.*

## Why
`registry.json` is the catalogue for the **agent** — JSON, perfect for "resolve + copy + wire." But a **human** (you) and a **client** can't read JSON, and "here's what we can build for you" is a sales conversation, not a file. The showcase is the **visual face** of the library: every proven element rendered live, grouped by tier.

## Two artifacts, one source of truth
- **`registry.json` = source of truth.** The agent reads it; the element **name is our shared vocabulary** ("add `cinematic-scroll-saga`" — we both know exactly what that is).
- **Showcase = generated FROM the registry**, never hand-maintained. A new `proven` element auto-appears; an element that **won't render in the showcase isn't actually proven** — so the showcase keeps the registry *honest*. Maintenance = add to the registry, the showcase follows.

## Prerequisite — add a `tier` field to the registry (do this first)
The registry has `name · version · status · summary · recipe · files · example · provenOn · deps · assetSlots · config`, but **no `tier`**. Tier (Essential / Signature / Flagship) currently lives only in `craft-lab/WHEN-TO-USE.md`. Add `"tier": "essential|signature|flagship"` to each element entry — it serves **both** the showcase (grouping) **and** the discovery skill (feature → element → tier mapping). Starting map (yours to finalise):
- **Essential:** `reveal`, `smooth-scroll`
- **Signature:** `cinematic-scroll-saga`, `horizontal-scroll`, `kinetic-typography`, `page-transition-morph`, `custom-cursor`, `microinteractions`, `preloader-gateway`, `hover-image-distortion`
- **Flagship:** `r3f-3d-hero`, `material-shader`

## What it is
A small **deployable Next app** (the IDP template stack) that:
1. Reads `elements/registry.json`, filters to `status: proven`.
2. Renders each element **live** from its `example` config — or, for the heavy 3D/GLSL ones, a short autoplay loop / poster with a **"live demo"** button (keeps the index page fast).
3. **Groups by `tier`** — Essential / Signature / Flagship. This grouping *is* your packages/pricing page.

## The card (straight from the registry schema)
Each element card shows:
- **name** + `version` badge (the shared vocabulary) · **tier** badge
- `summary` (the one-line "what it is")
- `deps` as tech chips · `provenOn` (credibility: "shipped on Hingulapuran")
- a live preview (or poster + demo link) · a **"view recipe"** link (`recipe`)

## Client use (the sales flow)
"Here's **Essential** / **Signature** / **Flagship**" → client points at the cards they want → because each card carries its **registry name**, you know the exact bricks to drop into their IDP site. Tier grouping turns the showcase into the quote.

## Build discipline (it must pass its own gates)
- Brand-**neutral** (sells *any* client; not a Bugadi lookalike).
- Heavy elements (`r3f-3d-hero`, `material-shader`): lazy + IntersectionObserver mount + lite/poster fallback per `PERFORMANCE.md` — the showcase itself is a proof that the gates hold.
- Run the **verification matrix** before showing a client (cold-load, real phone, reduced-motion, every fallback). The version you demo is the one you ran the matrix against — never the warm-cache localhost.

## Where it lives
`showcase/` inside the IDP (driven by `registry.json`, so it travels + stays in sync) — or a separate demo repo if you want it deployed independently. In-IDP is recommended: one registry, one showcase, no drift.

## Definition of done
- Every `proven` element renders (or has a poster + working demo link).
- Grouped by tier; brand-neutral; passes the verification matrix on a real phone.
- Generated from the registry — adding an element to the registry makes it appear with zero showcase edits.
