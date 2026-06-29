-- Migration: domain_foundation
-- Stage 3D.6 — Domain Foundation
--
-- Adds studio ownership model before Admin Authentication (Stage 4A).
-- No RLS policies — all access via service_role. RLS deferred to Stage 5.
-- No role or is_active columns on studio_members — deferred.
-- Storage path change is a code-only change; no SQL needed here.

-- ============================================================
-- 1. Create studios
-- ============================================================
CREATE TABLE studios (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT, UPDATE ON TABLE studios TO service_role;

-- ============================================================
-- 2. Seed Masha's studio row
--    UUID is fixed and must match DEPLOYMENT_STUDIO_ID in .env.
--    2617c7d8-23bb-4269-ab2e-fd104c3d12b8
-- ============================================================
INSERT INTO studios (id, name)
VALUES ('2617c7d8-23bb-4269-ab2e-fd104c3d12b8', 'Masha Tattoo Studio');

-- ============================================================
-- 3. Add studio_id to requests — nullable first to allow backfill
-- ============================================================
ALTER TABLE requests
  ADD COLUMN studio_id UUID;

-- ============================================================
-- 4. Backfill all existing rows to Masha's studio
-- ============================================================
UPDATE requests
SET studio_id = '2617c7d8-23bb-4269-ab2e-fd104c3d12b8'
WHERE studio_id IS NULL;

-- ============================================================
-- 5. Enforce NOT NULL, then add FK
--    Order matters: NOT NULL first, then FK (both are table-level
--    ALTER statements and Postgres validates them at execution time).
-- ============================================================
ALTER TABLE requests
  ALTER COLUMN studio_id SET NOT NULL;

ALTER TABLE requests
  ADD CONSTRAINT requests_studio_id_fkey
    FOREIGN KEY (studio_id) REFERENCES studios(id);

-- ============================================================
-- 6. Create studio_members
--    user_id references auth.users — Supabase managed auth table,
--    always present. Empty after migration; Stage 4A inserts rows.
-- ============================================================
CREATE TABLE studio_members (
  user_id    UUID        NOT NULL REFERENCES auth.users(id),
  studio_id  UUID        NOT NULL REFERENCES studios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, studio_id)
);

ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT, DELETE ON TABLE studio_members TO service_role;

-- ============================================================
-- 7. Drop old create_request function
--    Exact signature from 20260622000000_create_requests.sql:
--    12 parameters — UUID, TEXT×10, BOOLEAN, JSONB
--    IF EXISTS is safe; errors if signature drifts.
-- ============================================================
DROP FUNCTION IF EXISTS create_request(
  UUID,    -- p_client_submission_id
  TEXT,    -- p_client_name
  TEXT,    -- p_description
  TEXT,    -- p_placement
  TEXT,    -- p_size
  TEXT,    -- p_color
  TEXT,    -- p_budget
  TEXT,    -- p_email
  TEXT,    -- p_phone
  TEXT,    -- p_contact_other
  BOOLEAN, -- p_consent
  JSONB    -- p_files
);

-- ============================================================
-- 8. Recreate create_request with p_studio_id
--    p_studio_id is the second parameter, after p_client_submission_id.
--    Supabase JS client uses named args so position is irrelevant,
--    but keeping insert order logical.
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
  p_contact_other         TEXT,
  p_consent               BOOLEAN,
  p_files                 JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_id       UUID;
  v_ref_code TEXT;
  v_file     JSONB;
BEGIN
  v_ref_code := 'REQ-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('request_seq')::TEXT, 4, '0');

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
    contact_other,
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
    p_contact_other,
    p_consent
  )
  RETURNING id INTO v_id;

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
-- 9. Grants for new create_request signature
--    Revoke from PUBLIC, grant EXECUTE to service_role.
--    Must list the NEW 13-parameter signature.
-- ============================================================
REVOKE ALL ON FUNCTION create_request(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_request(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) TO service_role;
