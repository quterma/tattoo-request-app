-- Migration: harden_create_request_search_path
-- Stage 5B.1 — Production Hardening
--
-- Fixes the Supabase advisor "function_search_path_mutable" finding for
-- create_request. Sets an explicit, safe search_path so the function's
-- unqualified identifiers (requests, request_files, request_seq — all in
-- public) cannot be affected by a caller-influenced search_path.
--
-- No behavior, signature, parameter, return shape, or grant change intended.
-- ALTER FUNCTION ... SET only modifies pg_proc.proconfig; it does not touch
-- prosrc (function body), proargtypes (parameters), prorettype (return type),
-- or proacl (grants).
--
-- Rollback: ALTER FUNCTION public.create_request(uuid, uuid, text, text, text,
-- text, text, text, text, text, text, boolean, jsonb) RESET search_path;

ALTER FUNCTION public.create_request(
  uuid,    -- p_client_submission_id
  uuid,    -- p_studio_id
  text,    -- p_client_name
  text,    -- p_description
  text,    -- p_placement
  text,    -- p_size
  text,    -- p_color
  text,    -- p_budget
  text,    -- p_email
  text,    -- p_phone
  text,    -- p_contact_other
  boolean, -- p_consent
  jsonb    -- p_files
)
SET search_path = public, pg_temp;
