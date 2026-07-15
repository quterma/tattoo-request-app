# Tattoo Request App — Stage 6 Functional Specification

Version: 1.0
Status: Approved for implementation
Scope: Public Website (Visitor Experience)
Companion: `STAGE_6_PRODUCT_DEFINITION.md` (PRD). Product context, goals, journey, and Owner Decisions D1–D10 live there and are referenced here, never restated.
Appendix A is the Content Specification (normative copy only).

## 1. Purpose and Boundaries

Engineering source of truth for the public website: navigation, page responsibilities, the Request flow at field level, system behavior including failure states, content rules, and verifiable acceptance criteria.

Not defined here: visual design, styling, component architecture, implementation details.

**Internal boundary.** Submitted requests are stored and surfaced through the existing internal admin application (Stages 4B–5D); artist-side behavior, including notification of new requests, is governed by internal documentation. This spec's responsibility ends when a valid request is durably persisted and assigned a reference code.

**Escalation rule.** Engineers must not expand scope, add pages or flows, duplicate canonical content, or resolve open product questions during implementation. Anything this document does not answer is escalated as a product decision.

---

## 2. Navigation and CTAs

Primary navigation, identical and persistent on all public pages: **Home, Process, Request, Location** (PRD D9). No secondary navigation hierarchy. Preparation and Aftercare are not in the primary navigation; they are reached by the artist-sent direct URL (primary path) and by two links in the global footer as in-product fallback discovery (PRD §5). The footer links do not make these pages part of the primary navigation and do not appear as a fifth/sixth nav item.

Every page has exactly one primary CTA. Secondary contextual links are allowed only when they help complete the current task and must never compete with it.

| Page | Primary CTA |
| --- | --- |
| Home | Start Your Request |
| Process | Start Your Request |
| Location | Start Your Request |
| Request | Submit Request |
| Success | Back to Home |
| Preparation / Aftercare | none (content pages) |

---

## 3. Pages

Canonical ownership rules: §5. Normative copy: Appendix A. All other content is authored by the owner; missing content is a blocker, not something engineering improvises.

### 3.1 Home

Purpose: confirm the visitor found the right artist and move them toward a request.

Must contain: Hero (name, one-line specialization, city), Featured Work (4–8 owner-curated images), Mini Process (4–5 one-line steps, consistent with PRD D5), Good Fit teaser, Price teaser (PRD D8), primary CTA.

Must not contain: long policies, preparation/aftercare content, detailed FAQ, long-form duplicates of Process content.

### 3.2 Process

Purpose: answer the questions that normally create repetitive Direct conversations.

Must contain: Process Overview (full journey including post-submission reply per PRD D5/D3), Pricing (canonical), Good Fit (canonical, incl. respectful redirect per PRD D7), Design Process, Booking Policy (canonical; deposit terms in prose only — PRD §4), FAQ (canonical; owner-supplied from real recurring DM questions), primary CTA.

### 3.3 Request

Specified at field level in §4.

### 3.4 Success

Purpose: eliminate post-submission uncertainty.

Must contain, in order:

1. Confirmation the request was received; no further action required.
2. Reference code (§4.6).
3. Response expectation: reply within 48 hours (PRD D5).
4. Reply channel echo: all contact methods the visitor provided, displayed as entered (method name + value, unmasked) in a mobile-friendly list rendered from submitted data — not a generic sentence. The list is method-agnostic: it renders whatever methods exist in the submitted request, so adding future methods (e.g., Telegram) requires no change to this section. Under the current field model (§4.2, field 9) exactly one method is provided. (Confirmed unchanged by the 2026-07-15 five-method amendment: still one method per request, and this section was already method-agnostic — Telegram, now a real method, was already named here as the example.)
5. Channel-specific expectation note for each displayed method (Appendix A §A.2).
6. Primary CTA: Back to Home.

Reachable only immediately after a successful submission. If opened directly, refreshed, or reached without a successful submission in the current session, redirect to Home.

### 3.5 Location

Purpose: minimize arrival friction. Must contain: address, map, studio photos, transport/parking, entrance instructions if non-obvious. No marketing content.

### 3.6 Preparation

Purpose: reduce repetitive pre-session questions; audience is booked clients (PRD §5). Scope: appointment preparation only. No pricing or booking content.

### 3.7 Aftercare

Purpose: reduce repetitive post-session questions. Scope: healing and care only, written as the artist's own instructions. No pricing or booking content.

---

## 4. Request Flow — Field-Level Specification

### 4.1 Structure

Single mobile-first form; blocks in order: **Introduction → Idea → Project Details → Reference Uploads → Contact → Eligibility & Privacy → Submit**.

Introduction: 2–3 sentences — what the form is, that it replaces a long DM exchange, the 48-hour promise (PRD D5).

Field-inclusion rule (normative): every field must help the artist's initial accept/decline decision; anything else is not collected. No field outside the table below may be added without escalation.

### 4.2 Fields

| # | Field | Block | Type | Required | Purpose | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Idea description | Idea | Multiline text | **Yes** | What does the client want? | Min 20 chars, max 1,000, trimmed; counter shown near limit. |
| 2 | Placement | Project Details | Select | **Yes** | Where on the body — verbal placement guaranteed regardless of photo (PRD D4). | Owner-configured options, all concrete body areas; **no "Other" / free-text** (amended 2026-07-15 — see below). |
| 3 | Approximate size | Project Details | Select | **Yes** | Session scale, feasibility. | Owner-configured cm ranges + "Not sure". |
| 4 | Color preference | Project Details | Select | **Yes** | Style/technique fit. | **Black & grey / Color** — two options only (amended 2026-07-15, owner; the earlier "Black only"/"Not sure" were dropped). Artist's advice welcome. |
| 5 | Artist work the client likes | Reference Uploads | Image upload | No | Which of the artist's directions resonates. | §4.3. |
| 6 | External inspiration | Reference Uploads | Image upload | No | Desired mood/style; inspiration, not replication (§A.1 copy). | §4.3. |
| 7 | Body placement photo | Reference Uploads | Image upload | No | Real anatomy of the intended area. | §4.3. |
| 8 | Name | Contact | Text | **Yes** | Addressing the reply. | 2–80 chars. |
| 9 | Contact method | Contact | Select | **Yes** | Reply channel (PRD D3). | **Email / Phone (call) / WhatsApp / Instagram / Telegram** (amended 2026-07-15 — see below); the offered set is per-studio configurable; reveals exactly one value field (10a–e). |
| 10a | Email (if Email) | Contact | Email | **Yes**\* | Reply destination. | RFC-basic validation. |
| 10b | Phone (if Phone) | Contact | Tel | **Yes**\* | Reply destination — a **call** number. | Valid phone; Israeli formats with or without +972; normalized to E.164 on submit. |
| 10c | Phone (if WhatsApp) | Contact | Tel | **Yes**\* | Reply destination — a **WhatsApp** number. | Same as 10b (E.164, Israeli formats). |
| 10d | Instagram handle (if Instagram) | Contact | Text | **Yes**\* | Reply destination. | 1–30 chars; leading @ stripped; Instagram username charset. |
| 10e | Telegram (if Telegram) | Contact | Text | **Yes**\* | Reply destination. | Handle/username: leading @ stripped, username charset (same shape as Instagram). |
| 11 | Eligibility confirmation | Eligibility & Privacy | Checkbox | **Yes** | Age policy + request is for self (PRD D6). | Must be checked; age threshold rendered from owner-configurable value. |
| 12 | Budget (optional) | Project Details | Text | No | Helps the artist gauge scope/feasibility and the accept/decline decision (owner decision 2026-07-14). | Free text, max 50 chars, trimmed; no format enforced — a range or a note is fine. |

\* Exactly one of 10a–10e exists in the DOM at a time, determined by field 9.

**Contact-model amendment (owner decision 2026-07-15).** Field 9 offers **five** methods — Email,
Phone (call), WhatsApp, Instagram, Telegram — not the shipped three. Phone and WhatsApp are separate
methods on purpose (call vs. message). The offered set is **per-studio configurable** (Stage 6: code
config in the request feature; no admin UI — post-release backlog). Persistence is five dedicated
nullable columns; the admin card shows only the filled method. Exactly one method is still chosen per
request, so the "reveal exactly one value field" model is unchanged — only the count grew. Full
record, incl. the storage trade-off and validation details: PROJECT_DECISIONS.md — "Stage 6 Contact
Model".

**Placement "Other" removed (owner decision 2026-07-15).** Field 2 (Placement) no longer has an
"Other" option or any free-text entry. The select offers only concrete body areas and the visitor
picks the nearest one. Rationale: the free-text "Other" added a conditional required field and a
loosely-validated free string for a rare case, and the required placement **photo** (field 7)
already covers an atypical location far better than a typed phrase. Precision on an unusual spot is
traded for a simpler, faster mobile select — an acceptable trade for the artist's initial
accept/decline decision (the §4.1 field-inclusion test). Removes `placementOther` from the field
model, the schema, and the payload; no DB column is needed for it.

**Budget-field amendment (owner decision 2026-07-14).** Field 12 (Budget) is added as an **optional** field. The earlier field model deliberately omitted it, and PROJECT_BACKLOG.md recorded any budget field as needing a PRD/FS change first — this amendment is that change (PRD §9). Rationale: the artist finds a rough budget genuinely useful for the initial accept/decline decision (the §4.1 field-inclusion test), and as an optional field it adds no friction for a visitor who skips it. It stays **optional** and free-form — no enforced ranges, no required entry, no effect on submit validity. It sits in the Project Details block. Placement in the on-screen order and any label/hint copy are owner-authored (Item 3 / the visual pass), not fixed here.

**Owner-configurable values.** All owner-configurable values in this document (age threshold, placement options, size ranges) are implementation-level configuration — constants or config files maintained by the developer. No administration UI for them exists, is implied, or may be built in Stage 6.

### 4.3 Upload constraints (fields 5–7, identically)

Up to 3 images per category, 9 total. Formats: JPEG, PNG, WebP, HEIC. **Max 4 MB per file** (amended 2026-07-14 from 10 MB — see below); client-side downscaling/compression permitted if quality remains adequate for evaluation. Each image shows a thumbnail with a remove control. **The thumbnail is the file's identifier in the UI; the file name is not displayed** (amended 2026-07-14 — see the file-name amendment below). Upload occurs on file selection with per-file progress and per-file failure state (§4.5).

**Size-limit amendment (owner decision 2026-07-14).** The original 10 MB limit is not deliverable on the current hosting: Vercel Node Functions reject any request body over 4.5 MB at the platform edge, before application code runs. Since each file is uploaded in its own request (selection-time upload, one file per `POST /api/upload`), the constraint is **per file, not per submission** — 9 files of 4 MB each are 9 independent requests and never sum against the limit. The limit is therefore set to **4 MB per file**, leaving headroom under the platform's 4.5 MB ceiling for multipart overhead. Files over the limit are rejected with a clear, actionable message; **client-side compression is not implemented in Stage 6** (it remains permitted by this section, and is under research — see PROJECT_BACKLOG.md). Rationale for why 4 MB is sufficient for the expected inputs (Instagram screenshots, reference images, phone photos of the placement area) and the residual risk (a high-resolution phone photo may exceed it and require the visitor to reduce it) are recorded in PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture".

**File-name display amendment (owner decision 2026-07-14, from the Item 1 live check).** The upload card does **not** display the selected file's name. The thumbnail already identifies the file visually — and more reliably than the name, since a phone's photo gallery does not surface file names to the person choosing the image, so a name like `IMG20211022093813.jpg` identifies nothing to the visitor while consuming horizontal space that pushes the per-file controls off a narrow mobile screen. This applies to every per-file state, including a rejected file (an oversized or wrong-format file is still shown by its thumbnail so the visitor can see *which* file to remove). Reason recorded so a later session does not "restore" the name as a perceived omission.

**Per-file control amendment (owner decision 2026-07-14, same source) — retry is for transport failure only.** A per-file **retry** control appears only when the failure is a network/server upload failure (§4.5, "Per-file upload failure") — the case where retrying can succeed. A file rejected by **validation** (over 4 MB, or an unsupported format) is not a transient failure and offers **remove only**, never retry: the file cannot become valid by retrying, so a retry control there is a false affordance that does nothing when tapped. §4.5's "retry/remove per file" is hereby read as: remove is always available; retry is available only for transport failures.

### 4.4 Upload motivation (implements PRD D4)

Each upload category is a **scannable motivation card**: category title, one benefit sentence (§A.1), then the upload control. The benefit sentence is visually primary — in reading order, no smaller than body text. Nothing in the flow may state or imply uploads are required; empty categories produce no warning, confirmation dialog, or error state at submit.

### 4.5 States and failure behavior

**Submitting:** primary CTA disabled with progress; double-submit prevented.

**Success:** the request with all metadata and uploaded images is durably persisted, then the client is navigated to Success (§3.4) with the reference code and contact echo.

**Validation failure:** submit blocked; first invalid field scrolled into view and focused; every invalid field shows an inline message adjacent to it. No toast-only or summary-only errors.

**Submission (network/server) failure:** all entered data and successfully uploaded images preserved in place; retry affordance shown; visitor told nothing was lost. **Last-resort fallback:** only after at least two consecutive failed submit attempts, additionally show the Instagram fallback line (§A.4). The fallback is a technical-failure recovery path only — it never appears during normal operation and must not be presented as an alternative to the form.

**Per-file upload failure:** affects only that file (retry/remove per file); never blocks form submission — a failed upload is simply absent from the request.

**Abandonment:** no server-side draft persistence (PRD §4). In-memory persistence within the session is permitted, not required.

**Abuse mitigation:** the endpoint must be protected against automated submission (mechanism is implementation's choice, e.g., honeypot and/or rate limiting). Mitigation must be invisible to legitimate visitors; no CAPTCHA.

### 4.6 Reference code

Generated server-side on successful persistence. 6 characters, uppercase alphanumeric excluding O/0/I/1; unique per request. Shown on Success; stored with the request; identifies the request in the admin application. No public lookup functionality.

### 4.7 Privacy statement

Concise statement adjacent to the Submit control (§A.3).

---

## 5. Content Rules

**Canonical ownership.** Every topic has exactly one canonical page; other pages carry only short teasers linking to it. No duplicated long-form content site-wide.

| Topic | Canonical page | Teaser allowed on |
| --- | --- | --- |
| Pricing | Process | Home |
| Good Fit | Process | Home |
| Booking rules / policy | Process | — |
| FAQ | Process | — |
| Process explanation | Process | Home (Mini Process) |
| Preparation | Preparation | — |
| Aftercare | Aftercare | — |

FAQ exists once, on Process. Preparation/Aftercare may use question-style sections, but any question belonging to those topics lives only there.

**Hierarchy and length.** Every page: primary task → supporting information → CTA. Short paragraphs; expandable details where appropriate; no large uninterrupted text blocks; no unrelated content.

---

## 6. Acceptance Criteria

Stage 6 public website is complete when every statement verifies true:

1. A request cannot be submitted with any required field (§4.2) missing or invalid.
2. A request can be submitted with zero uploads, with no warning or error presented.
3. Invalid submission focuses the first invalid field and shows inline errors on all invalid fields.
4. A network failure during submit preserves all entered data and uploaded images and offers retry; the Instagram fallback appears only after ≥2 consecutive failed attempts.
5. A successful submission persists the request before Success renders; Success displays confirmation, reference code, the 48-hour expectation, and every contact method the visitor provided (name + value, as entered). Opening Success without a successful submission in the current session redirects to Home.
6. Selecting each contact method shows exactly one matching value field, validated per §4.2.
7. Submission is impossible without the eligibility checkbox; the rendered age threshold matches the owner-configured value.
8. Each upload category displays its motivation card per §4.4; per-file failures never block submission.
9. Primary navigation on every public page is exactly Home / Process / Request / Location; Preparation and Aftercare are absent from it but reachable at stable URLs.
10. Every page presents exactly the primary CTA from §2 and no competing CTA.
11. Each topic in §5's table has exactly one long-form instance site-wide; Home contains only teasers for Pricing, Good Fit, and Process.
12. All visitor-facing copy is English only (PRD D10).
13. The public site exposes no booking, payment, account, chat, or lookup functionality (PRD §4).

---

# Appendix A — Content Specification (Normative)

Quoted copy is normative in intent; the owner may adjust wording without changing meaning. All other site content is owner-authored; missing content blocks implementation.

## A.1 Upload motivation cards (§4.4)

- Artist work you like: "Seen something of mine you love? It tells me exactly which direction speaks to you."
- External inspiration: "Mood boards welcome — I use them for direction and mood, never for copying another artist's work."
- Placement photo: "A quick photo of the area helps me judge size and flow on your body before I reply."

## A.2 Success page channel notes (§3.4 item 5)

One note per method the visitor may have chosen (five methods per the 2026-07-15 contact-model
amendment — see §4.2):

- Email: "Check your spam folder just in case."
- Phone (call): "I'll call from an unfamiliar number — that's me."
- WhatsApp: "The message will come from an unfamiliar number — that's me."
- Instagram: "The reply may land in your message requests."
- Telegram: "The message may land in a separate 'requests' or unknown-sender area."

## A.3 Privacy statement (§4.7)

"Your photos and details are used only to review your tattoo request. They're never shared with third parties for anything else."

## A.4 Failure fallback line (§4.5, last resort only)

"Something's not working on our side — sorry! Your details are still here. You can retry, or message me directly on Instagram: @{handle}."

This line stays **Instagram-specific even under the five-method contact model** (2026-07-15
amendment): it appears only when the submission itself failed, so it cannot route through the method
the visitor chose (that value was never submitted). Instagram is the primary acquisition channel
(PRD D1) — certain to exist and public — so the fallback is independent of field 9 by design.
