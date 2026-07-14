-- Migration: three_upload_categories
-- Stage 6 Item 1 — Upload-flow architecture
--
-- Replaces the two-category request_files.type constraint ('reference' | 'placement')
-- with the three FS §4.2 upload categories (fields 5–7): artist work the client
-- likes, external inspiration, body placement photo.
--
-- create_request's signature and body are UNCHANGED — it writes v_file->>'type'
-- verbatim, so only the CHECK constraint governs the allowed values. This is
-- deliberate: PROJECT_DECISIONS.md (Stage 5A, Staging Environment) requires a staging
-- environment before any change to the create_request RPC's signature or behavior.
-- This migration touches neither the function nor its grants.

-- 1. Drop the old constraint.
--    The original CHECK was declared inline and unnamed in
--    20260622000000_create_requests.sql, so Postgres auto-named it
--    request_files_type_check. VERIFY this name live before applying
--    (Dashboard → Database → Tables → request_files → Constraints), per
--    PROJECT_DECISIONS.md — Database Stage Completion Criteria.
ALTER TABLE request_files
  DROP CONSTRAINT IF EXISTS request_files_type_check;

-- 2. Backfill existing rows.
--    Live data is test/dev only (owner-confirmed 2026-07-14; PROJECT_DECISIONS.md
--    Stage 5A). 'reference' split into two new categories and a row cannot tell which,
--    since the shipped form mixed both under one input — 'artist_work' is the
--    arbitrary-but-harmless default on test rows.
UPDATE request_files SET type = 'artist_work'     WHERE type = 'reference';
UPDATE request_files SET type = 'placement_photo' WHERE type = 'placement';

-- 3. Add the new constraint, named explicitly this time.
ALTER TABLE request_files
  ADD CONSTRAINT request_files_type_check
  CHECK (type IN ('artist_work', 'inspiration', 'placement_photo'));
