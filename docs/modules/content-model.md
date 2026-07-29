# Module — Content Model (Tier-2 #13)

*Decide what's **static-in-code** vs **CMS-editable** BEFORE you design the schema. Deciding late forced rework on Purven, Patel CA, and Inspire Academy (content that "didn't exist yet" → fabricate or scramble a CMS mid-build).*

## The decision (do it at doc-03/06 time, before schema)

For every content type, pick a lane:

| Lane | When | Where it lives |
|---|---|---|
| **Static in code** | Rarely changes; the developer edits it; no non-technical editor needs it. | `lib/site.ts`, constants, MDX/route content. |
| **CMS-editable** | The client/owner updates it without a deploy (products, posts, team, testimonials, FAQs). | DB tables + an admin screen, or a headless CMS. |
| **Hybrid** | Structure fixed in code, instances editable. | Code defines the shape; rows hold the content. |

## The content-model artifact

Fill this table per site (it slots into doc 03/06) and freeze it before schema:

| Content type | Lane | Editor | Notes |
|---|---|---|---|
| e.g. Products | CMS-editable | staff | name, price, stock, images; drives catalog |
| e.g. Team | CMS-editable | admin | photo, role, bio |
| e.g. Legal pages | Static in code | dev | privacy, terms |
| e.g. Brand/contact | Static in code | dev | `lib/site.ts` |

## Why decide early

- A type you thought was static but needs client edits → a schema + admin screen you didn't plan (mid-build scramble).
- A type you put in the DB but never changes → needless tables + admin UI (over-build).
- **Don't fabricate content to fill a gap** — if it doesn't exist yet, model it as CMS-editable with an empty state (Safety Rail / Bugadi must-hold: never fabricate; seed with clearly-placeholder data, swap real before launch).
