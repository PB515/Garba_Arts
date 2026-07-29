# Worked example — Inspire Academy (round-trip against a REAL shipped build)

*Discovery run **reverse-validated against a real, shipped site** (`Desktop/aa`, one of the IDP's four foundational builds). This is the strongest kind of proof: run discovery on the original idea, then check the verdict against what was actually built. **Status: round-trip proof.***

**Date:** 2026-06-20 · **Verdict: capability = HIGH (marketing + portal + ops/CMS) · craft tier = ESSENTIAL (restrained — and correct)**

---

## 0. Why this one matters (the proof it serves)
Offered as a "Signature example." Running discovery honestly **surfaces the most important refinement so far: capability and craft tier are TWO SEPARATE AXES**, and the word "Signature" was being used in the *polish/feature* sense, not the *craft-tier* sense. Inspire Academy is a **flagship-grade build on the capability axis** and a **deliberately Essential build on the craft axis** — and that was the *right* call. Honestly reaching that (instead of rubber-stamping "Signature") is exactly what makes the skill genuine.

## 1. Raw input (reconstructed original idea)
> A solo maths teacher in Vadodara — **Snehal Soni Sir, ~25 yrs** — wants a website to get **more admission enquiries** (WhatsApp/call). Maths-only (boards + competitive). Later: manage students, attendance, fees, weekly marks, results; give parents updates. Wants it to look professional/credible.

## 2. Forced early questions → answers (from the real PRD)
- **Audience → device?** Vadodara parents + students, **mobile-first, mixed/low-end Android.**
- **The one action = success?** A **WhatsApp/call/form admission enquiry** (explicit success metric).
- **Verifiable claims?** Real: 25+ yrs, a 97/100 board result (named, consented), GBP reviews. **No guaranteed-marks/"No.1" claims** (it's in the No-List). Never fabricate.
- **Goal vs ask ("look professional")?** Goal is conversion + trust — *not* a showpiece. Calm/credible beats flashy here.

## 3. Feature → capability → tier → perf (the two axes, side by side)
| Feature | IDP capability | **Craft tier** | Perf / effort |
|---|---|---|---|
| Segment-router homepage | marketing/landing | **Essential** | trust-forward, fast |
| Concept-Gap Test (killer) | interactive tool + lead capture | **Essential** | the conversion hook; instant, mobile |
| Programmatic local-SEO pages (per class / per area) | marketing (content-model) | **Essential** | many fast static pages = the discovery engine |
| Results / About-Sir / Teaching method | content-model | **Essential** | credibility; real photos/creatives |
| Enquiry form + WhatsApp | forms + `lib/security` | **Essential — conversion core** | honeypot+rate-limit+consent |
| Lead dashboard (New→…→Joined) | admin + auth | **Essential** | functional ops |
| Student mgmt · attendance · fees · marks · reports | full ops/admin (custom) | **Essential** | heavy **capability**, zero craft |
| Parent portal (per-child marks) | portal (PART 7 security order) | **Essential** | private data; security-first, not cinematic |

**Read the table by column:** the **capability** column is enormous (marketing + a real ops back-office + a secured parent portal). The **craft-tier** column is uniformly **Essential**. High capability, low craft — on purpose.

## 4. Tier verdict (scorecard + overrides)
Scorecard: budget moderate (1) · brand sells on **clarity/trust (0)** · "wow" = **no, convert (0)** · audience **low-end mobile (0)** · **content they came to *do* (0)** = **1 → Essential.** And **three hard overrides all fire**: conversion-critical funnel · low-end audience · content-they-came-to-do. → **Essential craft, unambiguously.**

## 5. ROUND-TRIP — discovery's verdict vs what actually shipped
| Discovery predicted | Inspire Academy actually shipped | Match? |
|---|---|---|
| Craft tier **Essential**, restrained motion | docs/04: "calm/credible → restrained motion; reveal/pop-in/bounce only; reduced-motion safe"; **no GSAP/Three/Lenis** | ✅ exact |
| Conversion core = enquiry; killer = a self-serve tool | PRD goal = WhatsApp enquiries; killer = the Concept-Gap Test | ✅ exact |
| High capability: marketing + ops + portal, phased | phased: marketing → lead dashboard → student mgmt → parent portal | ✅ exact |
| Never-fabricate trust claims | No-List: no guaranteed marks, no "No.1" without proof | ✅ exact |
| Mobile-first perf, programmatic local SEO | per-class + per-area Vadodara pages, mobile-first | ✅ exact |

**The discovery process, run on the idea, reproduces the real shipped decisions.** That's proof-bar **#2/#3 (round-trip + tier calls survive)** — on a real foundational build, not a constructed one.

## 6. The two-axis finding (the refinement)
- **Capability axis** = *what the IDP backend builds* (marketing / ecommerce / portal / ops / CMS / auth). Inspire Academy = **high**.
- **Craft axis** = *how much cinematic craft the front-of-house earns* (Essential / Signature / Flagship). Inspire Academy = **Essential**.
- They are **independent.** "Signature" in casual use ("a serious, full-featured site we're proud of") describes the **capability/polish** axis; the tier rubric is the **craft** axis. The skill must report **both, separately**, or it will mis-tag exactly like this.

## 7. So does this fill the Signature slot? (honest answer)
**No — and that's the right answer.** It re-confirms **Essential craft** (like client-02), now on a **capability-heavy** build, and it delivers the first real **round-trip**. The genuine **Signature-CRAFT** example is the **`bugadi-showpage` Signature tier** (real GSAP pinned scroll-story + micro-interactions, built in `craft-lab` — scored 7 → Signature). That's the one to capture as client-04 to complete proof #1's third tier.

## META — notes for the skill
- **BIGGEST refinement to date: split the output into two axes — capability profile AND craft tier — explicitly.** A site can be capability-flagship + craft-essential. Feeding `doc-gen-master` needs both: *what to build* (capability) and *how much craft per surface* (tier). → fold into SKILL.md.
- **Round-trip validated the rubric on a real build** — the scorecard + the three hard-overrides reproduce a shipped restrained build. Strong evidence the tiering isn't arbitrary.
- **"Signature" is an ambiguous client word** — the skill should disambiguate (capability/polish vs craft tier) when a client/user uses it, rather than accept it.
- Re-confirmed cross-tier: the `audience→device→perf` forced question + the feature→capability→tier table now hold across **3 cases** (Flagship Hinglaj · Essential coaching · capability-heavy/craft-Essential Inspire).
