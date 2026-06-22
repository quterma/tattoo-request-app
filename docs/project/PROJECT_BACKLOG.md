# PROJECT_BACKLOG

## UX / Product Improvements

- FAQ as accordion on /policies page (after content stabilization)
- Add "Not a Fit" block (small tattoos, rush jobs, no concept, low budget)
- Sharpen positioning on Home:
  - focus on 3–6 hour sessions
  - large-scale work
  - Masha's style
- Price framing:
  - "starting from …"
  - filtering out low-budget clients
- Client expectations section:
  - trust the artist's style
  - multiple sessions possible
  - no micro-revisions
- Curated gallery:
  - 5–8 strong works instead of full feed

## File Upload UX (deferred from Stage 3A)

Current behavior: local file selection only, files listed by name below trigger.
Mobile gallery/camera selection via native file input is supported for MVP (see PROJECT_DECISIONS.md — Upload UX Decisions).

Deferred improvements (post-MVP):

- remove individual selected file (per-file delete)
- replace individual selected file
- accumulate files across multiple selections (currently replaced on each pick)
- image previews (thumbnails) for selected files
- richer upload UI (drag-and-drop, progress indicator)

## Request Form Improvements

- Required form fields are defined in PROJECT_CONTEXT.md (Request Form section).
  The following fields are candidates for addition or refinement post-MVP:
  - budget range
  - willingness to wait

## Frontend Improvements

- Extract typography components:
  - SectionTitle
  - SectionText
  - BulletList

- Replace split("\n") in i18n with string arrays

## AI Tattoo Title / Summary (post-MVP idea)

Future optional feature: AI-generated short title or summary for each request.

- Generated from description text + uploaded reference images
- Used in admin panel to label and scan requests at a glance
- Optional — not a required field, not shown to the client
- No architecture work required now; no DB column reserved
- Consider at Stage 4 or post-MVP, only if the admin workflow shows a clear need

## MIME Type Verification (post-MVP)

`validateFiles` in BFF trusts `file.type` from the multipart Content-Type header (browser-provided). No magic-byte verification is done. Acceptable for MVP at low volume with a known artist audience. Add magic-byte MIME checking if abuse is observed post-launch.

## Route-Level Tests

The `POST /api/request` handler currently has no tests — all coverage is on BFF helper functions in isolation. This is acceptable while the route only parses and validates. When 3C adds storage upload and DB insert orchestration, route-level integration tests become worthwhile to catch ordering bugs and error-path gaps.

Revisit at the end of Stage 3C.4 (end-to-end submission).

## API Route Constants (post-MVP)

Revisit route/path constants when admin routes, image proxy, and additional API endpoints are added.
Currently `/api/request` is the only endpoint and is used in one place — centralizing it now would be premature.
Introduce a `API_ROUTES` constant in `src/bff` or `src/shared/config` at that point.

## Admin Panel Enhancements

### Possible Repeat Client Indicator (post-MVP)

Goal: help the artist notice when multiple requests likely belong to the same person.

This is informational only — not blocking, not deduplication, not enforcement.
Idempotency (Stage 3D) deduplicates by `clientSubmissionId` only. This feature is separate.

Potential signals to compare across existing requests:
- email
- phone
- contact_other

Implementation options (decide at Stage 4+):
- highlight matching contact fields in the request detail view
- count badge on the admin list next to requests that share a contact value
- manual "repeat client" flag set by the artist

No DB changes required now. Existing `email`, `phone`, `contact_other` columns are sufficient.
Do not implement until the admin panel exists and the artist confirms this is a real workflow need.

## Observability (post-MVP)

- Add Sentry (error tracking)
- Add PostHog (behavior tracking, form drop-off)

Condition: only after real traffic exists
