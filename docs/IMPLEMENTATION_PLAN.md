# Tattoo Artist Request App — Implementation Plan

## 1. Purpose

Define a staged implementation plan for the MVP described in MVP_SCOPE.md,
with clear goals per stage and minimal coupling between stages.

This plan is intentionally high-level and may be refined during development.

---

## 2. Guiding Principles

- One stage = one coherent goal
- Stages can be paused, reordered, or expanded
- No premature optimization
- Scope strictly follows MVP_SCOPE.md

---

## 3. Stage 0 — Project Baseline

Goal: runnable project with documentation in place.

Steps:

- Initialize Next.js project (App Router, TS, Tailwind)
- Verify local dev environment works
- Add docs folder and MVP/Architecture documents
- Prepare placeholder folders (e.g. supabase)

Exit criteria:

- Project runs locally
- Docs stored in repo

---

## 4. Stage 1 — Design Kit & Layout Foundation

Goal: establish visual and layout baseline before feature work.

Steps:

- Define design tokens (colors, typography, spacing)
- Implement basic layout primitives (page wrapper, header, footer)
- Implement base UI atoms (button, input, textarea, select, badge)
- Verify mobile-first behavior

Exit criteria:

- Consistent UI baseline
- No feature-specific styling yet

---

## 5. Stage 2 — Public Pages

Goal: static informational surface of the app.

Steps:

- Home page with navigation
- Rules / Process / Pricing page (static content)
- Studio / Location page (map + info)
- Basic i18n structure enabled (EN content only active)

Exit criteria:

- Pages accessible and readable on mobile
- Navigation works

---

## 6. Stage 3 — Request Form (UI + UX)

Goal: collect structured request data on the client side.

Steps:

- Build request form UI
- Client-side validation
- Upload UI (previews, replace before submit)
- Consent checkbox and basic privacy note
- Success state UX
  “Implement explicit submission state flow (FSM-style) using useReducer (no XState) to manage: editing → validating → uploading → submitting → success/error.”

Exit criteria:

- User can complete the form end-to-end (without persistence)

---

## 7. Stage 4 — Backend Integration (Supabase)

Goal: persist data and files.

Steps:

- Define request data schema
- Configure storage buckets and access rules
- Connect form submission to database
- Upload files to storage
- Handle basic error states

Exit criteria:

- Requests and files stored successfully
- Data visible via admin tools (Supabase dashboard)

---

## 8. Stage 5 — Notifications

Goal: notify artist about new requests and unread items.

Steps:

- Create Telegram bot credentials
- Implement backend notification trigger on new request
- Implement reminder logic for unread requests
- Basic failure handling (retry or fallback)

Exit criteria:

- Artist receives Telegram messages reliably

---

## 9. Stage 6 — Admin Interface

Goal: internal tool for processing requests.

Steps:

- Admin authentication
- Request list view (filters, unread state)
- Request details view (data + images)
- Status changes and internal notes
- Mark-as-read behavior

Exit criteria:

- Admin can process requests without external tools

---

## 10. Stage 7 — Localization & RTL Validation

Goal: ensure multi-language readiness.

Steps:

- Finalize i18n structure
- Add RU / HE test content
- Validate RTL layout behavior
- Language switcher logic (feature-flagged if needed)

Exit criteria:

- App renders correctly in LTR and RTL
- No layout regressions

---

## 11. Stage 8 — QA & MVP Validation

Goal: verify MVP completeness and readiness for real use.

Steps:

- Manual QA (mobile-first)
- Edge cases (uploads, partial submissions)
- Performance sanity checks
- Demo scenario walkthroughs

Exit criteria:

- All MVP acceptance criteria met
- App usable for real requests

---

## 12. Post-MVP (Out of Scope)

Potential future stages (not part of this plan):

- CMS integration
- Calendar sync
- Payments
- Analytics
- Multi-artist support

---

## 13. Plan Flexibility

- Stages may be split or merged
- Technical decisions may evolve
- Scope changes require MVP_SCOPE.md update

This plan is the single reference for implementation sequencing.
