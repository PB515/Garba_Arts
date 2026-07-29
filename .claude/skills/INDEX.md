# Skills library — INDEX

*The master shelf of Claude Code skills. The **whole** library is copied into each new project's `.claude/skills/` at kickoff, so the build agent has them locally and self-activates whichever the task needs (skills trigger by description — no manual calling). Maintain only this master; never patch a project's copy in place (Safety Rail: the skills library). Full role descriptions + the "when to add a skill" filter: `docs/skills-sop.md`.*

*The original "do not exceed three" cap is retired — see `docs/skills-sop.md`. The filter that produced it (repeated, proven need a pattern can't cover) is still the real gate on adding more.*

| Skill | Purpose | Status |
|---|---|---|
| `discovery/` | Turns a fuzzy client idea into a structured, buildable brief (feature → capability → craft tier). Step 0. | ✅ present |
| `frontend-design/` | Overall craft — distinctive type, committed colour, composition; avoids generic AI aesthetics. Steer to the brand via doc 04 + the Brief. | ✅ present *(updated 2026-07 to a more developed version)* |
| `taste-skill/` | Brand-kit / taste layer — design judgement and anti-laziness craft. | ✅ present |
| `motion/` | Named motion pieces (pop-in · reveal · bounce) + reduced-motion. Motion-lib flavored. | ✅ present *(reconstructed from spec — see the skill's note)* |
| `gsap-core/`, `gsap-timeline/`, `gsap-scrolltrigger/`, `gsap-react/`, `gsap-frameworks/`, `gsap-plugins/`, `gsap-performance/`, `gsap-utils/` | GSAP — second sanctioned animation library alongside Motion, for complex timeline/scroll/SVG choreography. 8 tightly-scoped skills, one per concern. | ✅ present *(added 2026-07, not yet validated on a real IDP build)* |
| `power-design/` | Brand-DNA-driven HTML generator (decks + prototype sites); 70+ pre-built brand systems. | ✅ present *(added 2026-07; different output paradigm than the template — prototyping tool, not build-pipeline)* |
| `shadcn/` | shadcn/ui component management — add/search/fix/style, presets, registries. | ✅ present *(added 2026-07, reverses a prior rejection — see BACKLOG.md)* |
| `style-directions/` | 66 named aesthetic-direction presets for inspiration (not verbatim templates). | ✅ present *(added 2026-07)* |
| `ui-ux-pro-max/` | Searchable design-intelligence database — styles, palettes, typography, UX guidelines, 10 stacks. | ✅ present *(added 2026-07)* |

The visual-layer wiring lives in `docs/modules/anti-ai-look.md` (tokens-before-UI, the tells, the AA-contrast CTA rule) and `tooling/ai-tell-lint` (copy hygiene on pre-commit).
