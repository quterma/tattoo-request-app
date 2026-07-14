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
4. Reply channel echo: all contact methods the visitor provided, displayed as entered (method name + value, unmasked) in a mobile-friendly list rendered from submitted data — not a generic sentence. The list is method-agnostic: it renders whatever methods exist in the submitted request, so adding future methods (e.g., Telegram) requires no change to this section. Under the current field model (§4.2, field 9) exactly one method is provided.
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
| 2 | Placement | Project Details | Select | **Yes** | Where on the body — verbal placement guaranteed regardless of photo (PRD D4). | Owner-configured options; "Other" reveals required free text (max 100 chars). |
| 3 | Approximate size | Project Details | Select | **Yes** | Session scale, feasibility. | Owner-configured cm ranges + "Not sure". |
| 4 | Color preference | Project Details | Select | **Yes** | Style/technique fit. | Black only / Black & grey / Color / Not sure — artist's advice welcome. |
| 5 | Artist work the client likes | Reference Uploads | Image upload | No | Which of the artist's directions resonates. | §4.3. |
| 6 | External inspiration | Reference Uploads | Image upload | No | Desired mood/style; inspiration, not replication (§A.1 copy). | §4.3. |
| 7 | Body placement photo | Reference Uploads | Image upload | No | Real anatomy of the intended area. | §4.3. |
| 8 | Name | Contact | Text | **Yes** | Addressing the reply. | 2–80 chars. |
| 9 | Contact method | Contact | Select | **Yes** | Reply channel (PRD D3). | WhatsApp / Email / Instagram; reveals exactly one value field (10a–c). |
| 10a | Phone (if WhatsApp) | Contact | Tel | **Yes**\* | Reply destination. | Valid phone; Israeli formats with or without +972; normalized to E.164 on submit. |
| 10b | Email (if Email) | Contact | Email | **Yes**\* | Reply destination. | RFC-basic validation. |
| 10c | Instagram handle (if Instagram) | Contact | Text | **Yes**\* | Reply destination. | 1–30 chars; leading @ stripped; Instagram username charset. |
| 11 | Eligibility confirmation | Eligibility & Privacy | Checkbox | **Yes** | Age policy + request is for self (PRD D6). | Must be checked; age threshold rendered from owner-configurable value. |

\* Exactly one of 10a/10b/10c exists in the DOM at a time, determined by field 9.

**Owner-configurable values.** All owner-configurable values in this document (age threshold, placement options, size ranges) are implementation-level configuration — constants or config files maintained by the developer. No administration UI for them exists, is implied, or may be built in Stage 6.

### 4.3 Upload constraints (fields 5–7, identically)

Up to 3 images per category, 9 total. Formats: JPEG, PNG, WebP, HEIC. Max 10 MB per file pre-processing; client-side downscaling/compression permitted if quality remains adequate for evaluation. Each image shows a thumbnail with a remove control. Upload occurs on file selection with per-file progress and per-file failure state (§4.5).

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

- Email: "Check your spam folder just in case."
- Instagram: "The reply may land in your message requests."
- WhatsApp: "The message will come from an unfamiliar number — that's me."

## A.3 Privacy statement (§4.7)

"Your photos and details are used only to review your tattoo request. They're never shared with third parties for anything else."

## A.4 Failure fallback line (§4.5, last resort only)

"Something's not working on our side — sorry! Your details are still here. You can retry, or message me directly on Instagram: @{handle}."
