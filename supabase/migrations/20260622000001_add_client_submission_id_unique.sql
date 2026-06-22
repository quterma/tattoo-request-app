-- Migration: add_client_submission_id_unique
-- Stage 3D — Request Identity & Idempotency
--
-- Adds UNIQUE constraint on requests.client_submission_id.
-- client_submission_id was NOT UNIQUE in Stage 3C.3 (storage use only).
-- Stage 3D completes the idempotency story: the constraint is the DB safety net
-- that prevents duplicate rows even under concurrent request races.

ALTER TABLE requests
  ADD CONSTRAINT requests_client_submission_id_key UNIQUE (client_submission_id);
