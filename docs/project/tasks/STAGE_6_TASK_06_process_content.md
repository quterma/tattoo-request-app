# Task: Stage 6 — Process page content rewrite + form intro + placeholder swaps (Item 6)

## Status

`ready` · created 2026-07-23 · copy approved by the owner 2026-07-23 (v3, after 3 rounds) ·
evidence base: `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md`

## Execution

- Executor: `claude` or `codex` — copy + i18n only, no logic. Decision-free: the copy below is
  **approved verbatim**; do not rewrite it. If delegated: `Executor: codex`, `Reviewer: claude`.
- Baseline: the commit that introduces this task file.
- Reviewer: `claude` + independent Codex cross-review to consensus (touches source).
- Allowed Write Surface: `src/shared/i18n/messages/en.json` (`process`, `request.introduction`,
  `app` metadata namespaces), `app/[locale]/(public)/process/page.tsx` (section structure to match
  the new content), `src/features/request/config/form.ts` (`INSTAGRAM_HANDLE`),
  `app/[locale]/layout.tsx` + `app/[locale]/opengraph-image.tsx` (only the `__meta_TODO` copy
  strings), tests for the above, PROJECT_* reporting docs.
- May touch dependencies / migrations: **no**.

## Context

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **Copy is approved and final for this pass** — the owner reviewed three drafts; the text in
   "Approved copy" below is what ships. Do not improve, re-word, or re-order it. Wording questions
   go back to the owner, not into the diff.
3. Evidence + rationale for every phrasing choice:
   `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md` (Findings 1 §§2–7, Outcome).
4. Governing spec: FS §3.2 (Process must contain Overview, Pricing, Good Fit, Design Process,
   Booking Policy, FAQ, primary CTA), FS §4.1 (form intro), FS §5 (FAQ lives once, on Process),
   PRD D5 (48h reply), D7 (respectful redirect), D8 (canonical pricing on Process).
5. Read the shipped copy first: `en.json` → `process`, `request.introduction`, `app`.

## Approved copy

**Page H1: `Process & Pricing`** (navigation label stays `Process`).

### Overview
> Everything that usually takes a long DM thread — how I work, what it costs, and whether we're a
> match. If it reads right, send a request; I answer within 48 hours.

### Good Fit
> I make original, medium-to-large tattoos in a painterly style rooted in Japanese and Chinese art
> and calligraphy, with a contemporary edge. Your references set the direction — the design itself
> is always mine, created for you and no one else.
>
> If you're looking for fine line, lettering, a very small tattoo, or an exact copy of an existing
> piece, an artist who specializes in that will be a better match — and I'll say so up front.

### Pricing
> ₪1,000 per hour, with a ₪2,000 minimum. Placement and complexity don't change the rate — they
> change how much time the work takes, and time is what you pay for.

### Booking & Deposit
> Want to talk it through first? Consultations are free, in person, no deposit needed.
>
> When we agree to go ahead, we book your session and take a ₪1,000 deposit — this locks in the date
> and starts the sketch. It isn't an extra charge: the full amount counts toward your tattoo. The
> deposit is non-refundable; one date change is free, and it moves with you. After a no-show or a
> second change, booking again takes a fresh one.
>
> **Bigger projects:** work over several sessions is paid session by session — and no second deposit:
> the one you've already paid moves with the project and counts toward the final sitting.

### Design & Sketch
> Your sketch is built on what we've agreed — idea, references, placement — interpreted in my style.
> It reaches you the day before the session, and small refinements happen at the appointment itself.
>
> The sketch itself costs nothing extra. But a complete redo is new work: the deposit pays for the
> first version, and starting over takes a new one. Trust your artist! 🖤

### Touch-ups
> Free within 3 months of your session. Later than that, they're priced by time, like any other work.

### Age
> You must be 18 or older to book through this site. At 16–17, tattooing is possible only with a
> parent's written consent and presence — message me on Instagram and we'll arrange it properly.

### Languages
> Sessions run in Hebrew, English, or Russian — whichever is comfortable.

### Payment
> The deposit is the only advance payment; the rest is due after each session — cash, Bit, or bank
> transfer.

### FAQ
> **Is the sketch free?** — Yes, the sketch is included when you book. Only a complete concept change
> needs a new deposit (see Design & Sketch above).
>
> **What if I change my idea?** — Small adjustments are part of the process. A completely new
> direction means a new sketch and a new deposit.
>
> **Do you do cover-ups?** — Yes. A cover-up is priced like any other piece — by the time it needs.
> Include a photo of the existing tattoo in your request.
>
> **Can a large tattoo be split into sessions?** — Yes, that's normal for big work. You pay per
> session; the deposit stays with the project until the final sitting.
>
> **Does it hurt?** — Depends on placement and how long we work — some spots are easy, some less so.
> Breaks are always fine, and we'll pace the session together.
>
> **I only have a rough idea — is that enough?** — Yes. A feeling, a theme, a few references — that's
> plenty. Turning it into a design is my job.
>
> **How do I prepare — and what about healing?** — Each has its own short guide: [Preparation] for
> before the session, [Aftercare] for after.

Plus the existing primary CTA at the end of the page (Item 2's shared component) — unchanged.

### Request-form introduction (FS §4.1) — replaces the `__intro_TODO` placeholder
> This form replaces a long back-and-forth in my DMs and keeps everything about your idea in one
> place. You don't need to have every detail figured out — share what you know, and I'll reply within
> 48 hours.

### Metadata (`__meta_TODO` copy strings only)
- Title: `Masha Karda — Original Tattoos in Tel Aviv`
- Description: `Original, medium-to-large tattoos inspired by Japanese painting and calligraphy.
  Every design drawn from scratch — send a request and get an answer within 48 hours.`
- Studio/site name: `Masha Karda`

## Scope

1. Replace the `process` namespace in `en.json` with the approved copy. Section order above is the
   shipping order (**note: Booking & Deposit comes BEFORE Design & Sketch** — deliberate, the deposit
   starts the sketch). Adjust `process/page.tsx` section rendering to match (sections were
   named for the old copy: `fees`, `tipping`, `deposits`, `designPolicy`, `touchUps`, `agePolicy`,
   `faq`).
2. **Delete the `tipping` section entirely** — dropped from the page by this rewrite.
3. The two FAQ links to **Preparation** and **Aftercare** are real in-page links (`/preparation`,
   `/aftercare`) — this is the new discovery path for those pages (see TASK_15).
4. Replace `request.introduction` with the approved intro; delete the `__intro_TODO` key.
5. `INSTAGRAM_HANDLE` in `src/features/request/config/form.ts`: `"your_studio"` →
   `"mashakarda_tattoo"` (the real handle, already in `en.json`'s footer).
6. Swap the `__meta_TODO` copy strings (title/description/site name) per above. **Leave the other
   `__meta_TODO` markers in place** — the real domain, OG image, favicon and `robots` flip are still
   pre-deploy owner swaps.
7. **Age copy corrects a live contradiction:** the old copy advertised "16–17 with parental consent"
   while the form accepts 18+ only (`AGE_THRESHOLD = 18`). The new copy keeps the form as-is and
   routes minors to Instagram DM. Do **not** change the form's eligibility logic.

## Out of Scope

- Home page (Item 5 — cut separately, same evidence base).
- Removing the footer Preparation/Aftercare links (TASK_15 — needs a PRD/FS amendment).
- Visual/layout redesign — this is a content pass; reuse existing section primitives.
- Any change to pricing/deposit *policy* (facts are owner-supplied and fixed).

## Completion obligations

```text
- CO-1 — No orphaned i18n keys: every key removed from `process` (incl. `tipping`, `__intro_TODO`)
  has no remaining reference in the tree, and every new key is rendered. Verify by grep + a passing
  build. Disposition: OPEN.
- CO-2 — Live read-through of /en/process and /en/request on a mobile viewport: no truncation, the
  Preparation/Aftercare FAQ links resolve, the CTA renders. Disposition: OPEN.
- CO-3 — Owner + artist review of the shipped page (they will re-read the live copy; this task ships
  the approved text, it does not pre-empt their final wording pass). Disposition: OPEN — owner.
```

## Review Granularity

`single` — copy + i18n, no logic change.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Propose commit from the working tree; commit only on explicit owner
approval.
