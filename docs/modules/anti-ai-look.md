# Module — Anti-AI-Look

*Why AI-built sites are recognisable on sight, and the wiring that prevents it. This is the practical form of charter principle 3: the IDP standardises the plumbing, never the skin. Synthesised from the `frontend-design` skill, backlog entries 9–10 (motion + skills), and the four builds' "looks AI-made" feedback.*

---

## The one rule

**Set the tokens before you build any UI.** The generic look comes from designing on top of defaults and backfilling brand later. Reverse it: fill `globals.css` tokens + `lib/site.ts` from doc 04 (Design System) *first*, then every component is built in the brand from line one. The token file ships *required-to-customise* with a deliberately loud placeholder palette — if you still see magenta, you skipped this step.

## The tells, and the fixes

| AI tell | Fix |
|---|---|
| Generic fonts (Inter, Roboto, Arial, system, Space Grotesk) | A **distinctive** display face + a refined body face, wired via `next/font`. Never converge on the same font across sites. |
| Timid, evenly-distributed palette | One dominant colour + a committed accent. Sharp, intentional, from doc 04. |
| Purple gradient on white | Don't. It's the canonical AI signature. |
| Predictable layout (centered hero, three cards, repeat) | Asymmetry, overlap, deliberate composition. Match layout to the brand, not a template. |
| Flat, decoration-free surfaces | Atmosphere appropriate to the brand — texture, depth, considered detail (only as much as the aesthetic wants). |
| Em-dash-heavy, "seamless/elevate/delve" copy | `ai-tell-lint` on pre-commit catches the mechanical tells; write like a human for the rest. |
| Static, unanimated | The motion layer — named entrance pieces, used with restraint (see the `motion` skill). |

## The skills do the craft

The skills library (`.claude/skills/`) is copied into every project so the agent self-activates them:

- **`frontend-design`** — distinctive type, committed colour, real composition. **Steer it to the brand** via doc 04 + the Business Brief's tone — never its bold default — and **verify WCAG contrast at launch**: its bold colours can land under AA and it won't self-correct.
- **`taste-skill`** — design judgement / brand-kit layer; the anti-laziness craft pass.
- **`motion`** — entrance motion via named pieces, with the reduced-motion / no-JS / mobile-Lighthouse checks (JS-driven, so those matter).

## The contrast rule (v5 #6 — a CTA failed AA on Purven)

The CTA/accent needs its **own** shade that passes **WCAG AA (4.5:1)** for its text, separate from the brand colour used elsewhere. The token file ships `--accent` + `--accent-foreground` as a pair for exactly this — verify the pair before launch. A brand colour that looks great as a background can fail as a button.

## Distinctive libraries (a note)

Reach for libraries that add character over the lowest-common-denominator default — but **decide the dependency deliberately** (Safety Rail 5). The `frontend-design` skill defaults to Framer/Motion for animation; that's a sanctioned exception to the no-dependency rule (backlog 9), not a free pass to add more.

## The gate

Per UI phase, before "done": **both themes · reduced-motion honored · 360px mobile · WCAG AA contrast (incl. the CTA pair) · no AI-tell copy.** (v5 #14 mobile/theme gate + this module.)
