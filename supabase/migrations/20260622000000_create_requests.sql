-- Migration: create_requests
-- Stage 3C.3 — Request Persistence

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Sequence for human-readable reference codes (REQ-YYYY-NNNN)
-- Global, no yearly reset. YYYY comes from insert timestamp.
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS request_seq START 1;
GRANT USAGE, SELECT ON SEQUENCE request_seq TO service_role;

-- ============================================================
-- requests
-- ============================================================
CREATE TABLE IF NOT EXISTS requests (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code        TEXT        NOT NULL UNIQUE,
  client_submission_id  UUID        NOT NULL,
  client_name           TEXT,
  description           TEXT        NOT NULL,
  placement             TEXT        NOT NULL,
  size                  TEXT        NOT NULL,
  color                 TEXT        NOT NULL,
  budget                TEXT,
  email                 TEXT,
  phone                 TEXT,
  contact_other         TEXT,
  consent               BOOLEAN     NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'contacted', 'booked', 'completed', 'rejected')),
  read_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- request_files
-- ============================================================
CREATE TABLE IF NOT EXISTS request_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID        NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('reference', 'placement')),
  storage_path  TEXT        NOT NULL,
  original_name TEXT        NOT NULL,
  mime_type     TEXT        NOT NULL,
  size          INTEGER     NOT NULL CHECK (size > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE request_files ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RPC: create_request
-- Atomically inserts request + files, generates reference_code.
-- Returns: id, reference_code.
-- Note: UNIQUE(client_submission_id) added in Stage 3D together
-- with full deduplication logic.
-- ============================================================
CREATE OR REPLACE FUNCTION create_request(
  p_client_submission_id  UUID,
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
  v_id            UUID;
  v_ref_code      TEXT;
  v_file          JSONB;
BEGIN
  -- Generate reference code from sequence + current year
  v_ref_code := 'REQ-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('request_seq')::TEXT, 4, '0');

  -- Insert request
  INSERT INTO requests (
    reference_code,
    client_submission_id,
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

  -- Insert file records
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
-- service_role permissions
-- service_role has BYPASSRLS but does NOT get table/sequence
-- permissions automatically when schema is created via SQL.
-- All required grants must be explicit.
-- Must appear after CREATE FUNCTION.
-- ============================================================

-- Tables
GRANT INSERT, SELECT, UPDATE ON TABLE requests TO service_role;
GRANT INSERT, SELECT ON TABLE request_files TO service_role;

-- RPC
REVOKE ALL ON FUNCTION create_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) TO service_role;
