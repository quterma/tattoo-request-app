# Tattoo Request App — Product Definition (PRD)

Version: 1.0
Status: Approved — Stage 6
Companion: `STAGE_6_FUNCTIONAL_SPECIFICATION.md` (defines what the system does; this document defines what the product is and why).
Reference direction: the Functional Specification cites this document. This document cites nothing.

---

## 1. Product Context

Mobile-first public web application for a professional tattoo artist.

Initial deployment: one artist, one studio, market Israel, Instagram-first acquisition.

Architecture must not prevent future expansion (multi-artist, multi-studio); Stage 6 is optimized exclusively for a single artist.

**Target audience.** Primary: visitors from the artist's Instagram, interested in her style, considering a custom tattoo. Secondary: returning clients; visitors seeking practical studio information. Not designed for cold traffic or marketplace browsing.

---

## 2. Product Vision

Instagram sells the artist; the website converts existing interest into a high-quality tattoo request. The website does not compete with Instagram — it replaces chaotic Direct conversations with a structured request while preserving a friendly, low-friction experience.

---

## 3. Product Goals

**Visitor:** understand the artist, the process, and pricing expectations; decide fit; submit a complete request with minimal effort.

**Artist:** fewer repetitive Direct conversations; more complete requests; fewer unsuitable requests; faster accept/decline decisions.

**Success = request quality, not quantity.** Evaluation (qualitative, no tooling): after the first 20 requests or 30 days, whichever comes first, the artist reviews requests against three questions — (1) did the first reply require a basic clarification round? (2) was the request within fit? (3) did the client respond in the channel they provided? The outcome feeds the Stage 6 retrospective and the D4 review trigger.

---

## 4. Non-Goals (Stage 6)

Out of scope: booking calendar; online payments / deposit processing; client accounts; messaging/chat; CRM; analytics; marketing automation; notifications infrastructure; SaaS customization; multi-studio support; AI features.

Future Scope (Section 7) must not influence Stage 6 implementation decisions.

---

## 5. Customer Journey

Instagram → Home / Process (confidence) → Request → Success → artist review (off-product) → artist replies via the contact method the client provided (off-product) → Preparation page → session (off-product) → Aftercare page.

**Ownership.** Product: Home, Process, Request, Success, Location. Artist: review, communication, booking, session. Product-supported: Preparation, Aftercare.

**Exits.** A visitor concluding the artist is not the right fit is a valid outcome; Good Fit content provides a respectful redirect (D7). A declined request is likewise valid; the decline happens off-product.

**Operational assumption — Preparation/Aftercare distribution.** These pages are reached primarily via stable, shareable URLs manually sent by the artist at the right journey moment (the artist-sent link remains the primary path — it is timed to the client's journey). The product provides stable URLs and content; timing the artist-sent link is the artist's responsibility. **In-product fallback discovery is provided by two links in the global footer (Preparation, Aftercare)** so a client who has lost the artist's message can still reach the page; these footer links are not primary navigation (PRD D9 keeps navigation to Home/Process/Request/Location) and do not surface the pages to a first-time Instagram visitor deciding fit. (Owner decision 2026-07-14, superseding the Stage 6 blueprint's original "no footer links / accepted risk" stance — see PROJECT_DECISIONS.md, Preparation/Aftercare in-product discovery.)

---

## 6. Product Principles

- Instagram is the primary acquisition channel; the website supports it.
- Mobile first; low cognitive load; short, scannable pages.
- One primary CTA per page; one user problem per content block; explain before asking.
- The request feels like a structured first Direct message, not a booking system.
- Collect only information required for the artist's initial accept/decline decision.
- Encourage, never force: optional inputs earn completion through communicated benefit.

---

## 7. Owner Decisions

Fixed for Stage 6. Each decision is stated once, here; the Functional Specification references, never restates.

**D1 — Marketing.** Instagram remains the primary acquisition channel; the website supports it.

**D2 — Request over booking.** The product collects a structured request. No booking functionality.

**D3 — Reply channel.** The artist replies using the contact information the visitor provided. No in-app communication.

**D4 — Uploads.** All three reference uploads (artist work the client likes; external inspiration; body placement photo) are optional. The required Placement field guarantees the artist always knows the intended body area in words. Upload completion is driven by prominent, scannable motivation content (FS §4.4), never by enforcement. Review trigger: if the Section 3 evaluation shows missing placement photos recurrently causing clarification rounds, the placement photo's optionality is re-decided.

**D4 amendment (owner decision 2026-07-18).** "Placement select" above is amended to "Placement field": the field's *type* (Select vs. free text) is an implementation detail, not a product decision this section governs — what D4 actually guarantees is that the artist always receives the intended body area in words, regardless of how that text is collected. This substance is unchanged; only the word "select" was stale after the 2026-07-17 owner decision to make Placement a required free-text input (`STAGE_6_FUNCTIONAL_SPECIFICATION.md` §4.2 field 2, implemented by `STAGE_6_TASK_09_placement_freetext.md`), which this amendment brings into alignment per §9's PRD-wins-on-conflict rule.

**D5 — Response promise.** Reply within 48 hours. Confirmed operationally sustainable. Single source for the promise; all copy derives from it.

**D6 — Eligibility.** The request includes a minimal confirmation: requester is 18 or older (owner-configurable threshold, default 18) and the request is for themselves. No ID verification in Stage 6; legal verification remains an in-studio responsibility.

**D7 — Fit framing.** Specialization is communicated positively ("I specialize in…"). Good Fit content includes a respectful redirect for out-of-fit visitors. Out-of-fit requests are declined respectfully in the artist's reply.

**D8 — Pricing disclosure.** Home shows a short pricing teaser; Process holds the canonical pricing content.

**D9 — Navigation.** Primary navigation is exactly: Home, Process, Request, Location. Preparation and Aftercare are contextual pages outside it (Section 5 assumption).

**D10 — Localization.** Stage 6 launches in English only. Hebrew (incl. RTL) and Russian are Future Scope. Stage 6 is not redesigned around localization; the existing next-intl foundation is sufficient future-proofing.

---

## 8. Future Scope

Possible evolution: multiple artists → multiple studios → artist-branded request platform → studio SaaS. Potential modules: notifications, booking, payments, CRM, client history, multi-user, localization, branding customization, reminders, testimonials, AI assistance, draft requests. None are part of Stage 6; none may influence Stage 6 decisions.

---

## 9. Change Control

Owned by the product owner. Changes to Sections 4, 5, and 7 are product decisions under the project framework's owner-decision process. The Functional Specification may not contradict this document; on conflict, this document wins and the conflict is escalated as a documentation defect.
