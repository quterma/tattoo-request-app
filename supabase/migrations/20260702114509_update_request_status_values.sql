-- Migration: update_request_status_values
-- Stage 4B.2 — Status Model Alignment
--
-- Replaces `contacted` with `active` in the requests.status allow-list.
-- Reason (see PROJECT_DECISIONS.md — Request Status Semantics): `in_progress` and `booked`
-- are orthogonal dimensions that cannot both be encoded in one exclusive status field.
-- `active` means an ongoing relationship with no concrete next appointment scheduled;
-- `booked` means a concrete next appointment (consultation or tattoo session) exists.
--
-- Does not modify the original 20260622000000_create_requests.sql migration.

-- ============================================================
-- 1. Backfill any existing 'contacted' rows to 'active' before
--    the constraint is replaced, so no row is left violating
--    the new CHECK once it is added.
-- ============================================================
UPDATE requests
SET status = 'active'
WHERE status = 'contacted';

-- ============================================================
-- 2. Replace the status CHECK constraint.
--    The original constraint was declared inline in
--    20260622000000_create_requests.sql with no explicit name,
--    so Postgres auto-generated the default name
--    "requests_status_check". Drop it and add an explicitly
--    named constraint so future migrations can reference it
--    directly instead of relying on the naming convention.
-- ============================================================
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_status_check;

ALTER TABLE requests
  ADD CONSTRAINT requests_status_check
    CHECK (status IN ('new', 'active', 'booked', 'completed', 'rejected'));
