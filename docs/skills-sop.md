# Skills SOP — the skill lifecycle (Tier-2 #10)

*How the skills library is maintained and grown. The master lives in `.claude/skills/`; the whole library is copied into each new project at kickoff. (Original `skills-library-sop.md` was not in the inputs; this captures the rule set from Safety Rail "skills library" + backlog entry 10.)*

## The model

- **One master, copied per project.** `.claude/skills/` is the single source of truth. At kickoff the *whole* library is copied into the new project's `.claude/skills/`, so the build agent self-activates whichever skill the task needs (skills trigger by their `description` — no manual calling).
- **Edit only the master.** Never patch a project's copy in place. Every NEW project copies the CURRENT master.
- **Each delivered site is pinned** to the skills it shipped with — improving the master later never changes a handed-off site (like pinned dependencies). This is deliberate: a global install would do the reverse.

## The members

*The charter's original "do NOT exceed these three" cap (§8) held while the library was hand-authored. It was already broken once in practice (`discovery` shipped as a 4th without the cap being revised) and broken again deliberately in 2026-07 (12 more skills added from external sources in one pass, with `gsap` alone contributing 8 — see the Adding-a-skill filter below and `CHANGELOG.md`). The cap as a literal number is retired; the filter that produced it (below) is still the real gate.*

| Skill | Role |
|---|---|
| `discovery` | Turns a fuzzy client idea into a structured brief — feature-to-capability mapping, craft tier, audience/performance budget. Step 0, before the Business Brief. |
| `frontend-design` | Overall craft — distinctive type/colour/composition, grounded in the subject. Steer to the brand via doc 04 + the Brief; verify WCAG contrast at launch. Updated 2026-07 to a more developed version (explicit brainstorm→plan→critique→build process, names the 3 AI-design clusters to avoid). |
| `taste-skill` | Design judgement / brand-kit; anti-laziness pass. |
| `motion` | Named entrance pieces (pop-in/reveal/bounce) + reduced-motion / no-JS / mobile-Lighthouse checks. Motion-lib flavored; see `gsap` for the complex-choreography counterpart. |
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-frameworks`, `gsap-plugins`, `gsap-performance`, `gsap-utils` | GSAP, added 2026-07 as a **second sanctioned animation library alongside Motion** (not a replacement — the 3 existing `elements/` components with `deps: ["motion"]` stay on Motion). Split into 8 tightly-scoped skills by the original authors (one per concern) rather than merged, to keep independent triggering precise. **Use Motion** for ordinary React micro-interactions; **use GSAP** for complex timeline sequencing, scroll-driven choreography (ScrollTrigger), and SVG work — exactly what the `elements/` library's higher-tier pieces (`cinematic-scroll-saga`, `horizontal-scroll`) are doing. |
| `power-design` | Brand-DNA-driven HTML generator (decks + fast prototype sites), 70+ pre-built brand systems. Different output paradigm than the template (single self-contained HTML file, not a Next.js app) — a fast prototyping/pitch tool alongside the IDP, not inside the site-build pipeline. Optional Firecrawl MCP dependency for URL-based brand extraction. |
| `shadcn` | shadcn/ui component management — add/search/fix/debug/style components, presets, registries. **Reverses a prior explicit rejection** — see `BACKLOG.md`'s rejected-ledger entry for the reasoning on both sides. |
| `style-directions` | 66 named aesthetic-direction presets (brutalism, glassmorphism, editorial, neon...) to draw inspiration from and further ideate — not a template to apply verbatim. Complements `frontend-design`'s process and `power-design`'s real-brand library. |
| `ui-ux-pro-max` | Searchable design-intelligence database — 50+ styles, 161 palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 10 stack-specific guides. Its Python search CLI degrades gracefully without Python (falls back to the static Quick Reference), consistent with the IDP's Node/TS-only tooling decision. |

## Adding a skill (most gaps still want a pattern, not a skill)

Skills are big; patterns are small (charter §8). Before adding a skill, ask: *is this a repeated, proven need that a pattern can't cover?* If yes:

1. Author `SKILL.md` (frontmatter `name` + a precise `description` — the description is how it triggers).
2. Add it to the master `.claude/skills/` + the `INDEX.md`.
3. Validate it on a real build before trusting it (an entry from one build is a draft; skills adopted wholesale from external sources in 2026-07 are similarly unvalidated on a real IDP build yet — see `CLAUDE.md`'s Known gaps).
4. Log the addition in `CHANGELOG.md`; if it was a backlog item, mark it done.
5. If the addition reverses a previously logged decision (rejected-ledger entry, a "do not revisit" call), log the reversal explicitly where the original decision lives — don't just silently overwrite it. Future sessions need to see *that* it changed and *why*, not just the new state.

## Maintenance

- Keep `INDEX.md` current (members + status).
- A skill's craft guidance must defer to the project's doc 04 + tokens — skills never override the brand.
- When a skill's default fights a rail (e.g. `frontend-design` reaching for a dependency), the rail wins unless the dependency is deliberately sanctioned (backlog 9 — Motion is the one sanctioned exception).
