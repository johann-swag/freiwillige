-- ============================================================
-- PostgreSQL Initialisation
-- Row Level Security (RLS) for tenant isolation
-- ============================================================
-- This runs once on first container start.
-- Schema migrations managed by Alembic thereafter.

-- Create Zitadel database
CREATE DATABASE zitadel;
CREATE USER zitadel WITH PASSWORD 'zitadel_change_me';
GRANT ALL PRIVILEGES ON DATABASE zitadel TO zitadel;

-- ── Enable RLS on all tenant-scoped tables (run after Alembic) ──────────────
-- These are templates — Alembic migration creates the actual tables.
-- Run after initial migration:

-- ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON volunteers
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ALTER TABLE placement_sites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON placement_sites
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON placements
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON documents
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON audit_log
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON comments
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ── Audit log is append-only ─────────────────────────────────────────────────
-- ALTER TABLE audit_log NO DELETE;  -- enforced at app level + DB trigger

CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only — deletions are not permitted';
END;
$$ LANGUAGE plpgsql;

-- Attach trigger after Alembic creates the table:
-- CREATE TRIGGER no_delete_audit_log
--   BEFORE DELETE ON audit_log
--   FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_delete();
