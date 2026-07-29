# Worked example — Hingulapuran (Hinglaj Mata book + awareness site)

*Live discovery capture. Raw material for the `discovery` skill. Fill as we work.*

**Date:** 2026-06-17 · **Status:** discovery

---

## 1. Raw input (as given)
> Client wants a site to **showcase a book** ("Hingulapuran", about Hinglaj Mata) — multiple books in future. He has the book as a **PDF**: people should **read online + download** it, to spread awareness of the concept. Also wants: a **blog** (related to the topic), an **image gallery** (curated Hinglaj Mata images), and a **map showing only Hinglaj Mata temples in the world**. Needs **basic admin** to manage books, blog (markup), gallery. Goal = spread awareness.
> Aesthetic: **Indian maximalism — but specifically Rajput / Kshatriya / warrior**, because Hinglaj is the *kuldevi*. Elements: sword, shield. Vibe: **strength + courage + astha (faith) + bhakti (devotion)** — the Kshatriya *pran/vachan* ethos ("pran jaye par vachan na jaye"). Craft wanted: **door intro, 3D object, horizontal scroll (the Mata-slays-asura legend), video scroll, GSAP.** User is most excited about the frontend.

## 2. Research grounding (decisive)
- Hinglaj Mata = one of the 51/52 **Shakti Peethas** (Sati's brahmarandhra/head fell there), a cave shrine on the **Hingol river, Balochistan**. **Kuldevi of Rajput, Charan, Brahmakshatriya, Lohana, Khatri** + many communities. Hinglaj Yatra = largest Hindu pilgrimage in Pakistan (~300k in spring).
- **CRITICAL, culturally-accurate insight:** the shrine is **aniconic — there is NO man-made idol.** The goddess is worshipped as a **sindoor-smeared stone** in a natural cave; the sacred objects are the **cave, the akhand jyot (eternal flame), trishul, sindoor**. → The 3D "object" must be a **sacred/warrior object (khanda sword, shield, trishul, akhand jyot/diya, the sindoor stone in the cave)** — NOT a 3D deity murti. Respectful AND a stronger hook.
- Kshatriya dharma: Raksha (protect weak), Shaurya (valor), Dharma (duty), loyalty, self-discipline; devotion fused with valor (Rama/Arjuna). → palette + motifs: deep maroon/rakta, gold, saffron, indigo, steel/black (swords); torana arches, dhal-talwar, jyot.

## 3. Feature list → IDP capability + craft tier + perf
| Feature | IDP capability | Craft tier | Perf / effort note |
|---|---|---|---|
| Home / landing | marketing/landing | **Flagship** | door → 3D object → myth scroll; heaviest; needs tested mid-device fallback |
| Book reader (online) + download; multi-book | content-model (books collection) + PDF serve/download | **Essential→Signature** | reading = RESTRAINT: fast, legible; tasteful entry, not over-animated |
| Blog | CMS (blog golden-path) | **Essential** | readable, SEO, shareable (awareness goal) |
| Image gallery (curated) | CMS (media) | **Signature** | reveal-on-scroll, hover, lightbox; image RIGHTS to confirm |
| Map — Hinglaj temples worldwide | data table + map lib (Mapbox/Leaflet) | **Signature→Flagship** | custom-styled map (NOT default Google); needs temple lat/long dataset |
| Admin (books/blog/gallery/map) | IDP admin patterns + Supabase auth | **Essential** | functional; one or few editors |

## 4. Site map (tier per section)
- `/` — door intro → hero (3D sacred object) → the myth (horizontal scroll) → "read the book" CTA — **Flagship**
- `/books` + `/books/[slug]` — collection + per-book reader/download — **Essential→Signature**
- `/blog` + `/blog/[slug]` — **Essential**
- `/gallery` — **Signature**
- `/temples` (map) — **Signature→Flagship**
- `/admin/*` — **Essential**

## 5. Decisions + rationale
- **Aniconic 3D** (sacred/warrior object, not a deity) — accuracy + reverence + better hook.
- **Books modeled as a collection from day 1** — adding book #2 = a DB row, not a rebuild (the replicable instinct, applied inside the site).
- **Tier discipline = the craft judgment:** Flagship on home + myth + map; **restraint on the reader + blog** (reading wants speed/legibility, not animation). This is WHEN-TO-USE in action — NOT everything is flagship.
- Craft placement: **door** = temple/cave threshold (torana, sword-shield motifs) → reveal the jyot; **horizontal scroll** = the Mata-slays-asura legend (scroll-painting, our cold-load-fixed recipe); **video scroll** = yatra/cave/Hingol river or animated climax, used sparingly.

## 6. Rough perf budget (set up front — heavy site)
- **Audience is the deciding factor:** devotees / awareness-seekers → heavy **mid-range Android + patchy networks** (India/Pakistan/diaspora). So **capability tiers + cold-load discipline are MANDATORY** (our exact deploy-scars). Flagship home/myth must degrade to a **still, reverent static** on weak devices/no-WebGL. Target: LCP green, 60fps high / 30fps floor, 3D+video lazy + paused off-screen, video all-keyframe re-encoded.

## 7. Open questions to take back to the client (the gold)
1. **Book/PDF:** language(s)? one PDF now? Reader = simple embedded (pdf.js) or a *designed* reader? Download — **open, or email-gated** (gating builds the awareness mailing list)?
2. **Map data:** does he have a list of Hinglaj temples worldwide (with locations), or do we research+seed? Roughly how many? (5 vs 50 changes the map design.)
3. **Gallery images:** does he own/have rights, or do we source? (copyright is real for deity/temple images.)
4. **The myth illustration (horizontal scroll):** which exact legend? And art pipeline — commission a Rajput-miniature artist / AI-generate in that style / source public-domain? (This is the schedule long-pole.)
5. **Languages/i18n:** English only, or + Hindi/Gujarati (vernacular helps awareness)?
6. **Audience devices:** confirm heavy mobile → locks the perf budget + fallback design.
7. **Brand:** existing logo/fonts/colours, or we design the Rajput system? Domain? Timeline? Budget tier? Admin editors (just him or a team)?

## 8. The brief (draft — finalises after Q&A)
> A Rajput/Kshatriya devotional **awareness platform** for the book *Hingulapuran* and the worship of Hinglaj Mata. Core: read the book online + download (multi-book ready), a topical blog, a curated image gallery, and a custom map of Hinglaj Mata temples worldwide, all managed via a simple admin. Front-of-house is a flagship, reverent, warrior-maximalist experience (cave-door intro, a draggable 3D sacred object, a horizontal scroll-painting of the goddess's legend, scrubbed video), built mobile-first with tested graceful degradation so it spreads on real low-end devices.

## 9. Round-2 answers + lore + decisions
**Answers:**
1. Book = **100-yr-old, Gujarati** (likely scanned PDF). Download **email-gated** (builds awareness list). ✓
2. Map: **no dataset; possibly thousands** (Gujarat alone). → can't hand-curate thousands. **Recommendation:** custom-styled map (MapLibre/Mapbox, themed parchment/sepia — NOT Google-blue) with an **admin-managed temple dataset** seeded with the *notable* shrines (Balochistan main + key Gujarat/Rajasthan/diaspora), growable + optional community "submit a temple". Quality/curation > thousands of unverified pins, and it matches the reverent tone.
3. Art = **AI-generated**; client generates from **my detailed prompts** — but ONLY *after* moodboard + brand colours/style locked.
4. Gallery = **seed some + client uploads rest** → admin image upload required; we provide initial curated set.
5. **i18n EN + Gujarati** (maybe + Hindi) — doubles as a capability proof (translation + Gujarati/Devanagari font styling). NOTE: i18n = site UI/blog; the *book* stays its original Gujarati PDF.
6. Brand = **from scratch, generate everything.** "Don't be shy."

**Lore (origin stories — to weave in visually):**
- **Sati → Shakti Peeth:** Sati dies, Shiva's tandav, Vishnu's Sudarshan cuts Sati into 51 pieces falling across Jambudvip; at Hingul (Balochistan) her **Brahmarandhra (crown of the head)** fell → Hinglaj.
- **Hingul-rakshasa legend (→ HORIZONTAL SCROLL):** asura disrupts a havan, Ganesh slays him; his younger brother **Hingul** does tapasya to Brahma, gains a vardan, grows mighty, defeats Indra + the devtas. Devtas appeal to Parvati; she vows the asura will fall. The asura sees a beautiful goddess *(specific description TBD by client)*, demands marriage, she refuses, he boasts and pursues — then an **unprecedented light** appears and consumes him; realizing who she is, he repents; she grants the vardan: **her name shall be Hinglaj**, and he and his people will be worshipped here till the end of the world.
- **Kshatriya-kuldevi (→ HERO MOMENT):** Parshuram is annihilating the Kshatriyas for failing their dharma; survivors flee and take **sharan** at Hinglaj; Mata, satisfied, declares "enough killing." Parshuram's power (borrowed/*udhaar* from Shiva) drains; bewildered, he goes to **Guru Dattatreya**, who reveals the power is **Mata Parvati's Shakti** (even Shiva draws from her) and tells him to do **Shakti sadhana**. After, Parshuram speaks with Hinglaj, the killing ends, and he **lays his sword at Mata's feet** (the famous Hinglaj image). From that day Hinglaj = kuldevi of the Kshatriyas.
- Many more stories → gallery captions, blog, small scroll vignettes.

**Decisions:**
- **3D object = akhand jyot (eternal flame / deva)** — recurring sacred symbol; flame shader + draggable diya. ✓
- **Horizontal scroll = the Hingul-rakshasa legend** (rise → chase → the great light → vanish → vardan). ✓
- **Parshuram's sword-at-the-feet = the emotional climax** for the warrior audience → a pinned/video-scroll hero moment.
- **Sati/51-pieces = the cosmic origin**, and it visually ties to the temple **map** (pieces falling across Jambudvip → shrines across the land).

## 10. Brand direction (moodboard — locking)
- **Essence:** *Veer + Bhakti* — devotion with a blade. Power held in reverence; maximalism in ornament/depth, discipline in layout.
- **Palette = DEEP + DARK** (client steer): `Rakta` #3E0A1A (deep oxblood, primary), `Raat` #12101F (cosmic night bg), `Sindoor` #B5302A (accent), `Kesari` #D97A1A (flame), `Swarna` #C9A227 (gold), **`Loha` #6E757C (steel — the deliberate cool accent that differentiates this from every other gold+maroon Hinglaj site; reads as swords)**, `Patra` #E7D7B8 (parchment reading surface), `Kajal` #1A1110 (ink).
- **Type:** body = Mukta Vaani; Gujarati = Baloo Bhai 2 (display) + Noto Serif Gujarati (text); Devanagari = Rozha One. **Display direction PENDING client pick:** A Cinzel (Roman carved capitals — monumental), B Eczar (Indic-rooted Latin serif — warm), C script-as-hero (Devanagari/Gujarati big + English quiet). My rec = **C + Cinzel pairing** (authentic + monumental + serves bilingual).
- **Sacred mantra (confirmed by client):** `ॐ हिंगुले परमहिंगुले अमृतरूपिणि / तनुशक्तिमनः शिवे श्री हिंगुलाय नमः` → use at door-reveal, jyot section, footer.
- **Next:** client picks display direction → lock type → write style-locked AI image prompts (door, akhand jyot, Hingul-legend scroll panels, Parshuram climax) → scaffold IDP clone.

## 11. Art direction (locked anchor) — Mata ni Pachedi
- **Display type:** Option **C** chosen — Devanagari/Gujarati script as hero (Rozha One / Baloo Bhai 2) + Cinzel as Latin partner.
- **THE art anchor = Mata ni Pachedi** (Gujarat's sacred Mother-Goddess temple-cloth; Vaghri/Devipujak/Chitara). Why it's the perfect reference (not generic miniature):
  - Restricted palette **= ours**: black (iron-rust+jaggery), red/maroon (alizarin), cream cloth → our `Kajal`/`Rakta`/`Patra` + add `Swarna` gold + `Loha` steel. Symbolism: red = energy/divine blood, black = protection/spiritual intensity, maroon = Mother Earth.
  - **Old FIERCE tone, not modern-sweet** — frontal, hieratic, protective Durga/Kali/Meladi; matches the old dakla/garba register the client wants.
  - **Already narrative cloth** (kalam pen figures + block-print borders telling goddess stories) → maps directly onto the horizontal-scroll legend.
- **Style lock for the 100 AI images:** *Mata ni Pachedi kalam-drawn goddess-cloth × Rajput/Marwar miniature detail; restricted maroon/black/cream + gold + steel; flat, frontal, fierce; ornamental block-print borders; aged-cloth texture; devotional-martial, NEVER sweet.*
- **Killer craft idea:** the Hingul-legend horizontal scroll = a **Mata-ni-Pachedi cloth unrolling** sideways (authentic + our cold-load-fixed recipe). Door = pachedi torana; akhand jyot = the lone 3D glow against the flat painted world.
- **Voice/tone:** lean the old fierce **Charan bardic / dakla** register (the 3 Kshatriya states — Rajasthan/Gujarat/Maharashtra — share a common Prakrit→Apabhramsha→Sanskrit spine), not the sweetened modern tone.
- **Latin display = Eczar** (client swapped from Cinzel — Indic-rooted, pairs with Devanagari, warmer/more Indian). Hero stays Devanagari/Gujarati (Rozha One / Baloo Bhai 2).
- **DINGAL / PINGAL = the site's organizing rhythm** (from the language history): **Dingal** = fierce Charan warrior-poetry (percussive, thunderous, "rap"-like, stirs warriors) → the **Veer/Shaurya** register for the asura battle, Parshuram, headlines, heavy motion. **Pingal** = soft lyrical Krishna-bhakti → the **Bhakti** register for the jyot, shloka, reading, tender moments. Site breathes between them. **The Charan bard = the narrator voice** (keeper of the fort's history → fits the book/awareness goal).

---

## 12. Asset technique + prompt sheet
- **Layered-PNG parallax = the depth engine** (client's idea): hero scenes generated as 5–6 *separate transparent PNG layers* at a fixed canvas size, stacked + parallaxed at different speeds. Cheap "3D", no heavy animation, degrades perfectly (just stops moving) — fits the mobile-first perf budget. Door (6 layers), Hero/jyot (5), Parshuram (3 optional). Legend panels stay FLAT (authentic pachedi cloth) and scroll horizontally.
- **Cohesion rule:** generate Door L1 first → approve → use as style reference (`--sref` / image prompt) for all 100 so they stay on-model.
- **Prompt sheet written:** `Desktop/hingulapuran/ART-PROMPTS.md` — global STYLE BLOCK + global NEGATIVE + per-layer descriptive prompts with fixed px sizes/orientation + generation order. (Client feedback that drove it: one-line prompts → slop; must be richly descriptive + pixel sizes + orientation decided up front — that's what the moodboard was *for*.)

## META — notes for the skill
- **The research step paid for itself immediately:** the aniconic fact flips the central 3D decision (deity → sacred object). The skill MUST force a "research the subject's actual iconography/sensitivities before deciding hero craft" step for devotional/cultural briefs.
- **Tier-assignment is the highest-value discovery output** — the table (feature → capability → tier → perf) is the skill's core artifact. Restraint calls (reader/blog NOT flagship) matter as much as the flagship calls.
- **Audience → perf budget** is a forcing function: "who opens this and on what device" should be an EARLY required question, because it sets the entire degradation strategy (our biggest scar).
- **Asset pipeline (myth art, gallery rights, video) is the schedule long-pole** — surface it in discovery, not mid-build.
- Strong candidate clarifying-question checklist is forming in §7 → generalise into the skill.
