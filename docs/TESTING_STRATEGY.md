# Testing Strategy

## 1. Goals

- Prevent regressions in critical user flows
- Validate business logic and data transformations
- Avoid over-testing UI and framework behavior

Testing is minimal and intentional.

---

## 2. What Is Tested

### 2.1 Feature Logic (Primary)

- Hooks in `features/*/model`
- Data preparation before submit
- Validation logic (required fields, limits, edge cases)

Reason:

- Hard to verify manually
- Easy to break during refactors
- Independent from UI

---

### 2.2 Request Form (Integration-lite)

- Happy path submit
- Validation errors
- Upload constraints handling
- Error states from backend abstraction

Backend is mocked via `services`.

---

### 2.3 Critical Utilities

- i18n helpers (if logic exists)
- Data mappers / formatters
- Any pure function used across features

---

## 3. What Is NOT Tested

- Visual layout and styling
- Static pages (home, rules, location)
- Shared UI atoms (Button, Input, etc.)
- External SDKs (Supabase, Telegram)
- Next.js routing and framework behavior

These are verified manually or trusted to dependencies.

---

## 4. Manual Verification (Instead of Tests)

Used for:

- Visual correctness (mobile-first)
- RTL/LTR layout behavior
- Navigation flows
- Admin usability
- Upload UX and previews

Manual checks are documented as a checklist, not automated tests.

---

## 5. Backend & External Services

- All backend access goes through `services/`
- Supabase SDK is mocked in tests
- No direct Supabase calls inside features

This ensures:

- Fast tests
- Deterministic behavior
- No network dependency

---

## 6. Test Levels Summary

- Unit tests: feature logic, hooks, utils
- Integration-lite tests: request form flow
- No E2E tests in MVP

E2E may be added post-MVP if product stabilizes.

---

## 7. When Tests Are Written

- After feature logic stabilizes
- Before refactors
- For bug fixes (regression-first)

No upfront coverage targets.

---

## 8. Definition of “Enough Testing”

Testing is sufficient when:

- Core request flow is safe to refactor
- Validation bugs are unlikely
- Manual testing covers the rest

Anything beyond this is optional.
