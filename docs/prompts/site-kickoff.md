# Prompt — Site Kickoff (Step 0, automated)

*Toolkit prompt · feeds SOP Step 0 (Clone & connect) · pairs with `docs/idp-usage-guide.md`*

*`idp-usage-guide.md`'s Step 0 assumes the clone already happened before you open Claude Code in the new folder. This prompt is for the other direction: you open a brand-new chat with nothing set up yet, and have that session do everything — including, if you don't have written docs yet, the discovery conversation itself.*

Two variants below, depending on what you're starting with. Same mechanics either way — only step 3 differs.

---

## How to use

1. Open a new Claude Code session. It doesn't matter what folder it starts in — the prompt anchors every path explicitly.
2. Pick your variant:
   - **You have docs** (a business brief, deep research, an ideation/spec doc) → Variant A. Paste the content directly, or give file paths.
   - **You have a rough idea and nothing written down** → Variant B. The session runs the `discovery` skill with you first, *then* clones and sets up the folder once you've resolved it together — this is exactly how `upasthiti` started.
3. Paste the matching prompt below into the new session, filling in the placeholders.

## VARIANT A — docs already exist (copy from here)

```
Set up a new client site using the Website IDP.

1. The IDP master lives at C:\Users\bpurv\OneDrive\Desktop\Website\IDP — read its
   CLAUDE.md first, then docs/idp-usage-guide.md, so you know the method before
   touching anything.

2. Create a new sibling folder for this site:
   C:\Users\bpurv\OneDrive\Desktop\Website\<SITE_NAME>\
   Use `git archive HEAD | tar -x` from inside IDP/ into the new folder (not a
   raw copy — this excludes node_modules/.env.local/build artifacts). Then
   `git init -b main` the new folder as its OWN independent repo — do not
   connect it to the IDP's remote. This is a frozen copy per
   docs/idp-usage-guide.md's model: edit only the master IDP; every site is a
   copy pinned to what it shipped with.

3. Here is my site info: [PASTE YOUR BRIEF/RESEARCH/SPEC HERE, or list file
   paths for Claude Code to read]

4. Place that info into the new site's docs/ under sensible filenames (e.g.
   docs/business-brief.md + docs/deep-research-report.md if it splits cleanly
   that way, or docs/project-spec.md if it's a single combined doc — use
   judgment, don't force a split that doesn't fit).

5. Fill the new site's CLAUDE.md from template/CLAUDE.md.template using ONLY
   real information from what I gave you. Where something is genuinely
   unresolved, write it as an explicit open item — never invent a placeholder
   and present it as decided.

6. Run `npm run setup` in the new site folder (root + template install, hook
   config, doctor check) and confirm it's green before doing anything else.

7. Then stop and tell me: what type of site this looks like (ecommerce /
   portal / portfolio / marketing — see docs/golden-paths/), and whether you'd
   recommend running the `discovery` skill first (if the idea is still fuzzy)
   or going straight to docs/doc-gen-master.md (if my info is already concrete
   enough, like a full spec). Wait for me before generating anything else.

Site name: <SITE_NAME>
```

## VARIANT B — just a rough idea, nothing written yet (copy from here)

```
I want to build a new site/app using the Website IDP, starting from a rough
idea — no docs exist yet.

1. The IDP master lives at C:\Users\bpurv\OneDrive\Desktop\Website\IDP — read
   its CLAUDE.md first, then docs/idp-usage-guide.md, so you know the method.

2. Read .claude/skills/discovery/SKILL.md inside that IDP folder, then run the
   discovery process WITH ME, right here in this chat, before creating
   anything on disk: capture my raw idea verbatim, ask the forced early
   questions (audience/device/network, the one action, what data actually
   exists, goal vs. the ask, constraints) one at a time, build the feature ->
   capability -> craft-tier table, score the tier with the rubric + hard
   overrides, and surface the real open questions — don't let me skip past
   something genuinely unresolved.

3. Once the brief is resolved, THEN: create a new sibling folder
   C:\Users\bpurv\OneDrive\Desktop\Website\<SITE_NAME>\ via `git archive HEAD |
   tar -x` from inside IDP/ (not a raw copy), `git init -b main` it as its own
   independent repo (not connected to the IDP's remote), write up the full
   discovery brief as docs/discovery-brief.md, and fill the new site's
   CLAUDE.md from template/CLAUDE.md.template using only what we actually
   resolved together — flag anything still open, never invent a placeholder.

4. Run `npm run setup` in the new site folder and confirm it's green.

5. Then stop and tell me whether the next step should be doc-gen-master's
   full doc set, or (if the scope is modest and the auth/data model has any
   real wrinkle) going straight to a focused App PRD + Data Model & Security
   doc before any code — same judgment call as usual. Wait for me.

My rough idea: [DESCRIBE IT — as raw and unpolished as it is in your head,
contradictions included; the discovery process is built to work with that]

Site name: not decided yet — discovery will usually make one obvious, or ask me
```

---

## Why it's shaped this way

- **Absolute paths, not relative ones** — a fresh session's working directory is unpredictable; anchoring to `C:\Users\...\Website\IDP` means step 1 always finds the right place regardless of where the session opened.
- **`git archive`, not a raw folder copy** — matches the rule in `SETUP.md`: never drag `node_modules` or machine-local files between contexts; `npm run setup` rebuilds them fresh in the new site.
- **A fresh, disconnected `git init`** — the site is a frozen copy from this point forward (`docs/idp-usage-guide.md`'s "two repos, never one" model); it must not track the IDP's history or remote.
- **Variant B discovers before cloning, not after** — the folder, the site name, even whether this is a portal/ecommerce/portfolio at all, are downstream of discovery's output. Cloning first and discovering into an already-named folder gets the order backwards.
- **The final step is always a deliberate pause, not automatic doc-gen** — whether `discovery`, a focused App PRD + Data Model & Security doc, or the full `doc-gen-master` treatment is the right next step depends on how concrete things are and whether there's a real architectural wrinkle (see `upasthiti`'s access-token deviation from the default portal auth pattern, CLAUDE.md decision 3, for a concrete example of "modest scope but still needs its own careful doc"). Let the session tell you which one it thinks fits, rather than assuming.
