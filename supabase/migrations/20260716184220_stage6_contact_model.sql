-- Migration: stage6_contact_model
-- Stage 6 — Task 03 Block C (five-method contact model)
--
-- Implements PROJECT_DECISIONS.md — "Stage 6 Contact Model" (2026-07-15) + "Contact-validation
-- amendment" (2026-07-16). Replaces the three-column contact model (email / phone / contact_other,
-- any one or several) with FIVE nullable columns of which EXACTLY ONE is set per request:
--   email, phone, whatsapp, instagram, telegram
--
-- Why five columns and not (contact_method, contact_value): owner decision, recorded — the
-- explicit, individually-typed shape makes the admin card trivial (render the non-null columns)
-- and each method a first-class field. Four-of-five NULL per row is an accepted trade-off.
--
-- EXISTING ROWS ARE DELETED, not backfilled (owner decision 2026-07-16). The old model allowed
-- zero OR several contacts, so historical rows cannot be assumed to satisfy "exactly one", and
-- contact_other's free text does not reliably map to Instagram vs. Telegram. The data is test-only
-- (5A.3 classification), so a clean start beats a guessed backfill — and it lets the CHECK below
-- be added immediately rather than deferred.
--
-- The reference-code generator below is carried over UNCHANGED from 20260715124427 (the current
-- live definition). It is reproduced here deliberately — this migration must not regress:
--   * the 6-char ambiguity-free code (FS §4.6),
--   * the generate/insert retry loop,
--   * the reference_code vs requests_client_submission_id_key discrimination,
--   * SET search_path = public, pg_temp,
--   * the request_files loop and the { id, referenceCode } return shape.
--
-- Staging gate: waived for the two Stage 6 create_request recreations (PROJECT_DECISIONS.md —
-- "Staging Environment", scoped exception 2026-07-15). Single prod project, test-only data.
--
-- Rollback: restore 20260715124427's function (13 params, p_email/p_phone/p_contact_other), drop
-- the three new columns, re-add contact_other, drop the CHECK. Deleted rows are NOT recoverable.

-- ============================================================
-- 1. Delete existing (test-only) requests
--    request_files rows go with them via the request_id FK.
-- ============================================================
DELETE FROM request_files;
DELETE FROM requests;

-- ============================================================
-- 2. Contact columns: add the three new methods, drop contact_other
-- ============================================================
ALTER TABLE requests
  ADD COLUMN whatsapp  TEXT,
  ADD COLUMN instagram TEXT,
  ADD COLUMN telegram  TEXT;

ALTER TABLE requests
  DROP COLUMN contact_other;

-- ============================================================
-- 3. Exactly-one-contact invariant, below the application layer
--    Zod and TypeScript already prevent zero/multi; this stops anything else from writing it.
-- ============================================================
ALTER TABLE requests
  ADD CONSTRAINT requests_exactly_one_contact CHECK (
    (
      (email     IS NOT NULL)::int +
      (phone     IS NOT NULL)::int +
      (whatsapp  IS NOT NULL)::int +
      (instagram IS NOT NULL)::int +
      (telegram  IS NOT NULL)::int
    ) = 1
  );

-- ============================================================
-- 4. Drop the exact old create_request signature
--    Named in full, without IF EXISTS: a signature typo must fail loudly here rather than
--    silently no-op and leave the old overload callable alongside the new one.
-- ============================================================
DROP FUNCTION public.create_request(
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
);

-- ============================================================
-- 5. Recreate create_request with the five contact params
-- ============================================================
CREATE FUNCTION create_request(
  p_client_submission_id  UUID,
  p_studio_id             UUID,
  p_client_name           TEXT,
  p_description           TEXT,
  p_placement             TEXT,
  p_size                  TEXT,
  p_color                 TEXT,
  p_budget                TEXT,
  p_email                 TEXT,
  p_phone                 TEXT,
  p_whatsapp              TEXT,
  p_instagram             TEXT,
  p_telegram              TEXT,
  p_consent               BOOLEAN,
  p_files                 JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id           UUID;
  v_ref_code     TEXT;
  v_file         JSONB;
  v_alphabet     TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_attempt      INT;
  v_max_attempts CONSTANT INT := 20;
  v_i            INT;
  v_constraint   TEXT;
BEGIN
  -- Generate a code and INSERT; on the (rare) unique collision, regenerate and retry.
  <<insert_loop>>
  FOR v_attempt IN 1..v_max_attempts LOOP
    -- Build a 6-char code from the ambiguity-free alphabet (FS §4.6).
    v_ref_code := '';
    FOR v_i IN 1..6 LOOP
      v_ref_code := v_ref_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::INT, 1);
    END LOOP;

    BEGIN
      INSERT INTO requests (
        reference_code,
        client_submission_id,
        studio_id,
        client_name,
        description,
        placement,
        size,
        color,
        budget,
        email,
        phone,
        whatsapp,
        instagram,
        telegram,
        consent
      ) VALUES (
        v_ref_code,
        p_client_submission_id,
        p_studio_id,
        p_client_name,
        p_description,
        p_placement,
        p_size,
        p_color,
        p_budget,
        p_email,
        p_phone,
        p_whatsapp,
        p_instagram,
        p_telegram,
        p_consent
      )
      RETURNING id INTO v_id;

      EXIT insert_loop;  -- insert succeeded
    EXCEPTION
      WHEN unique_violation THEN
        -- Two distinct causes share this error code; tell them apart by constraint name:
        --  1. requests_reference_code_* (reference_code) — regenerate and retry.
        --  2. requests_client_submission_id_key (idempotency) — a real duplicate submit;
        --     re-raise so the route's existing race-recovery path returns the existing code.
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        IF v_constraint = 'requests_client_submission_id_key' THEN
          RAISE;  -- idempotency race — not a ref-code collision; let the route recover
        END IF;
        IF v_attempt = v_max_attempts THEN
          RAISE;  -- exhausted retries on ref-code collisions — surface rather than loop forever
        END IF;
        -- otherwise: reference_code collision, loop to regenerate
    END;
  END LOOP insert_loop;

  FOR v_file IN SELECT * FROM jsonb_array_elements(p_files)
  LOOP
    INSERT INTO request_files (
      request_id,
      type,
      storage_path,
      original_name,
      mime_type,
      size
    ) VALUES (
      v_id,
      v_file->>'type',
      v_file->>'storagePath',
      v_file->>'originalName',
      v_file->>'mimeType',
      (v_file->>'size')::INTEGER
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id',            v_id,
    'referenceCode', v_ref_code
  );
END;
$$;

-- ============================================================
-- 6. Grants for the new 15-parameter signature
--    CREATE FUNCTION does not inherit the dropped function's ACL — restate them.
-- ============================================================
REVOKE ALL ON FUNCTION create_request(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_request(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) TO service_role;
