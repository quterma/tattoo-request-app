-- Migration: make_client_name_not_null
-- Stage 3D.5.2 — Audit Fix Pass
--
-- client_name was added as TEXT (nullable) in Stage 3C.3 before the clientName
-- requirement was introduced in Stage 3C.3.5. One test row (REQ-2026-0002) was
-- inserted without a client_name during Stage 3C.3 debugging.
--
-- This migration:
--   1. Backfills any null client_name rows with '[unknown]' (non-destructive)
--   2. Enforces NOT NULL, matching the application-level requirement

UPDATE requests
SET client_name = '[unknown]'
WHERE client_name IS NULL;

ALTER TABLE requests
  ALTER COLUMN client_name SET NOT NULL;
