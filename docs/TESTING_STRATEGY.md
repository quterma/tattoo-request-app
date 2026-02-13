# Testing Strategy

Minimal and intentional. No upfront coverage targets.

## What Is Tested

- **Feature logic (primary):** hooks in `features/*/model`, validation, data prep before submit
- **Request form (integration-lite):** happy path, validation errors, upload constraints, error states (backend mocked via `services`)
- **Critical utilities:** i18n helpers, data mappers, pure functions used across features

## What Is NOT Tested

- Visual layout, static pages, shared UI atoms
- External SDKs (Supabase, Telegram), Next.js framework behavior
- These are verified manually or trusted to dependencies

## Manual Verification

- Visual correctness (mobile-first), RTL/LTR, navigation, admin usability, upload UX

## Test Levels

- Unit: feature logic, hooks, utils
- Integration-lite: request form flow
- No E2E in MVP

## Rules

- All backend access goes through `services/` (mocked in tests)
- Tests written after feature logic stabilizes, before refactors, for bug fixes (regression-first)
- Sufficient when core request flow is safe to refactor and validation bugs are unlikely
