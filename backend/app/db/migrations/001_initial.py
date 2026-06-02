"""Initial schema with RLS policies

Revision ID: 001_initial
Revises:
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── TENANTS ───────────────────────────────────────────────────────────────
    op.create_table('tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(50), nullable=False),
        sa.Column('contact_email', sa.String(200), nullable=False),
        sa.Column('website', sa.String(500)),
        sa.Column('country', sa.String(2), nullable=False),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('plan', sa.String(20), default='core'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    # ── USERS ─────────────────────────────────────────────────────────────────
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(200), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('zitadel_user_id', sa.String(200), nullable=False),
        sa.Column('site_id', postgresql.UUID(as_uuid=True)),
        sa.Column('language', sa.String(5), default='de'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('zitadel_user_id'),
        sa.UniqueConstraint('tenant_id', 'email', name='uq_user_tenant_email'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
    )
    op.create_index('ix_users_tenant_id', 'users', ['tenant_id'])

    # ── PROGRAMS ──────────────────────────────────────────────────────────────
    op.create_table('programs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('service_type', sa.String(50), nullable=False),
        sa.Column('focus_areas', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('country', sa.String(2), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(50), default='planned'),
        sa.Column('description', sa.Text()),
        sa.Column('coordinator_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'slug', name='uq_program_tenant_slug'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['coordinator_id'], ['users.id']),
    )
    op.create_index('ix_programs_tenant_id', 'programs', ['tenant_id'])

    # ── PLACEMENT SITES ───────────────────────────────────────────────────────
    op.create_table('placement_sites',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('program_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('country', sa.String(2), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('address', sa.Text()),
        sa.Column('contact_name', sa.String(200), nullable=False),
        sa.Column('contact_email', sa.String(200), nullable=False),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('focus_areas', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('required_languages', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('duration_months', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('formbricks_form_id', sa.String(200)),
        sa.Column('rocket_channel', sa.String(200)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'slug', name='uq_site_tenant_slug'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['program_id'], ['programs.id']),
    )
    op.create_index('ix_sites_tenant_id', 'placement_sites', ['tenant_id'])

    # ── VOLUNTEERS ────────────────────────────────────────────────────────────
    op.create_table('volunteers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(200), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(), nullable=False),
        sa.Column('nationality', sa.String(2), nullable=False),
        sa.Column('languages', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('focus_interests', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('available_from', sa.DateTime(), nullable=False),
        sa.Column('preferred_duration', sa.Integer(), nullable=False),
        sa.Column('motivation', sa.Text()),
        sa.Column('emergency_contact_name', sa.String(200)),
        sa.Column('emergency_contact_phone', sa.String(50)),
        sa.Column('status', sa.String(50), default='new', nullable=False),
        sa.Column('match_scores', postgresql.JSON(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_volunteers_tenant_id', 'volunteers', ['tenant_id'])
    op.create_index('ix_volunteers_status', 'volunteers', ['status'])

    # ── PLACEMENTS ────────────────────────────────────────────────────────────
    op.create_table('placements',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('volunteer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('site_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('program_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), default='pending', nullable=False),
        sa.Column('start_date', sa.DateTime()),
        sa.Column('end_date', sa.DateTime()),
        sa.Column('confirmed_by', postgresql.UUID(as_uuid=True)),
        sa.Column('confirmed_at', sa.DateTime()),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['volunteer_id'], ['volunteers.id']),
        sa.ForeignKeyConstraint(['site_id'], ['placement_sites.id']),
        sa.ForeignKeyConstraint(['program_id'], ['programs.id']),
    )
    op.create_index('ix_placements_tenant_id', 'placements', ['tenant_id'])

    # ── DOCUMENTS ─────────────────────────────────────────────────────────────
    op.create_table('documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('volunteer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('placement_id', postgresql.UUID(as_uuid=True)),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('document_type', sa.String(100), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('file_key', sa.String(500), nullable=False),
        sa.Column('file_name', sa.String(200), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), default='uploaded', nullable=False),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True)),
        sa.Column('reviewed_at', sa.DateTime()),
        sa.Column('review_notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['volunteer_id'], ['volunteers.id']),
    )
    op.create_index('ix_documents_tenant_id', 'documents', ['tenant_id'])

    # ── DOCUMENT REQUESTS ─────────────────────────────────────────────────────
    op.create_table('document_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('volunteer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', sa.String(100), nullable=False),
        sa.Column('document_name', sa.String(200), nullable=False),
        sa.Column('mode', sa.String(50), nullable=False),
        sa.Column('requested_by_site_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(50), default='pending', nullable=False),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True)),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['volunteer_id'], ['volunteers.id']),
    )
    op.create_index('ix_doc_requests_tenant_id', 'document_requests', ['tenant_id'])

    # ── COMMENTS ──────────────────────────────────────────────────────────────
    op.create_table('comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('volunteer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('authored_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('authored_by_role', sa.String(50), nullable=False),
        sa.Column('comment_type', sa.String(50), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['volunteer_id'], ['volunteers.id']),
    )
    op.create_index('ix_comments_tenant_id', 'comments', ['tenant_id'])

    # ── AUDIT LOG ─────────────────────────────────────────────────────────────
    op.create_table('audit_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_role', sa.String(50), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('before', postgresql.JSON()),
        sa.Column('after', postgresql.JSON()),
        sa.Column('metadata', postgresql.JSON(), default={}),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
    )
    op.create_index('ix_audit_log_tenant_id', 'audit_log', ['tenant_id'])
    op.create_index('ix_audit_log_entity', 'audit_log', ['entity_type', 'entity_id'])

    # ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
    tables_with_rls = [
        'users', 'programs', 'placement_sites', 'volunteers',
        'placements', 'documents', 'document_requests', 'comments', 'audit_log'
    ]

    for table in tables_with_rls:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"""
            CREATE POLICY tenant_isolation ON {table}
            USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
        """)

    # ── AUDIT LOG — append-only trigger ───────────────────────────────────────
    op.execute("""
        CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE EXCEPTION 'audit_log is append-only';
        END;
        $$ LANGUAGE plpgsql
    """)

    op.execute("""
        CREATE TRIGGER no_delete_audit_log
        BEFORE DELETE OR UPDATE ON audit_log
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_delete()
    """)


def downgrade() -> None:
    tables = [
        'audit_log', 'comments', 'document_requests', 'documents',
        'placements', 'volunteers', 'placement_sites', 'programs', 'users', 'tenants'
    ]
    for table in tables:
        op.drop_table(table)
