# PROJECT_BACKLOG

Items here are candidates for future work that are not yet assigned to a stage.
Larger post-launch initiatives are tracked in PROJECT_IMPLEMENTATION_PLAN.md — Stage 2 (Post-Launch Roadmap).

---

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

---

## Request Form Improvements

- Required form fields are defined in PROJECT_CONTEXT.md (Request Form section).
  The following fields are candidates for addition or refinement post-MVP:
  - budget range
  - willingness to wait

---

## Frontend Improvements

- Extract typography components:
  - SectionTitle
  - SectionText
  - BulletList

- Replace split("\n") in i18n with string arrays

---

## MIME Type Verification (post-MVP)

`validateFiles` in BFF trusts `file.type` from the multipart Content-Type header (browser-provided). No magic-byte verification is done. Acceptable for MVP at low volume with a known artist audience. Add magic-byte MIME checking if abuse is observed post-launch.

---

## API Route Constants (post-MVP)

Revisit route/path constants when admin routes, image proxy, and additional API endpoints are added.
Currently `/api/request` is the only endpoint and is used in one place — centralizing it now would be premature.
Introduce a `API_ROUTES` constant in `src/bff` or `src/shared/config` at that point.

---

## Automated E2E / Integration Tests (pre-release)

Unit and route-level tests cover isolated logic and handler orchestration against mocks.
The following flows have no test touching a real database or storage layer:

- normal request submit: form → API → storage → DB → referenceCode returned
- replay with same `clientSubmissionId`: same `referenceCode`, no duplicate DB row
- UNIQUE constraint race fallback: cleanup + existing referenceCode returned
- failed DB insert: uploaded storage files deleted

Address before production release (Stage 5). Options:
- Vitest integration tests with a real Supabase test project (separate from production)
- Playwright / end-to-end tests against a local or preview deployment
- Manual test protocol executed before each release (minimum viable option for MVP)

See PROJECT_PRODUCTION_READINESS.md — Integration / End-to-End Test Coverage for full details.

---

## Supabase Generated Database Types

Generate Supabase TypeScript database types via the Supabase CLI (`supabase gen types typescript`) and use `createClient<Database>()` for both Supabase clients (`supabase.ts`, `supabaseAuth.ts`).

Goal: improve query result typing across all service modules and remove narrow casts such as `membership.studio_id as string` in `services/auth.ts`.

Suggested timing: Stage 5 Production Hardening, or earlier if Stage 4B introduces many Supabase queries that require similar casts.
