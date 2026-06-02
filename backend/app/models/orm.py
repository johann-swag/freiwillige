"""
SQLAlchemy ORM Models
======================
Mirrors the Pydantic schemas in masterdata.py.
Every table has: id, tenant_id, created_at, updated_at.
RLS policies defined in Alembic migration.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Index, Integer,
    String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def gen_uuid():
    return uuid.uuid4()


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False
    )


# ── TENANT ────────────────────────────────────────────────────────────────────

class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    contact_email: Mapped[str] = mapped_column(String(200), nullable=False)
    website: Mapped[str | None] = mapped_column(String(500))
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(20), default="core", nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="tenant")
    programs: Mapped[list["Program"]] = relationship(back_populates="tenant")


# ── USER ──────────────────────────────────────────────────────────────────────

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    zitadel_user_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    site_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("placement_sites.id"))
    language: Mapped[str] = mapped_column(String(5), default="de")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="users")

    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
        Index("ix_users_tenant_id", "tenant_id"),
    )


# ── PROGRAM ───────────────────────────────────────────────────────────────────

class Program(Base, TimestampMixin):
    __tablename__ = "programs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    focus_areas: Mapped[list] = mapped_column(ARRAY(String), nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="planned")
    description: Mapped[str | None] = mapped_column(Text)
    coordinator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="programs")
    sites: Mapped[list["PlacementSite"]] = relationship(back_populates="program")

    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uq_program_tenant_slug"),
        Index("ix_programs_tenant_id", "tenant_id"),
    )


# ── PLACEMENT SITE ────────────────────────────────────────────────────────────

class PlacementSite(Base, TimestampMixin):
    __tablename__ = "placement_sites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    program_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    contact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(50))
    focus_areas: Mapped[list] = mapped_column(ARRAY(String), nullable=False)
    required_languages: Mapped[list] = mapped_column(ARRAY(String), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_months: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    formbricks_form_id: Mapped[str | None] = mapped_column(String(200))
    rocket_channel: Mapped[str | None] = mapped_column(String(200))

    program: Mapped["Program"] = relationship(back_populates="sites")
    placements: Mapped[list["Placement"]] = relationship(back_populates="site")

    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uq_site_tenant_slug"),
        Index("ix_sites_tenant_id", "tenant_id"),
    )


# ── VOLUNTEER ─────────────────────────────────────────────────────────────────

class Volunteer(Base, TimestampMixin):
    __tablename__ = "volunteers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    nationality: Mapped[str] = mapped_column(String(2), nullable=False)
    languages: Mapped[list] = mapped_column(ARRAY(String), nullable=False)
    focus_interests: Mapped[list] = mapped_column(ARRAY(String), nullable=False)
    available_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    preferred_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    motivation: Mapped[str | None] = mapped_column(Text)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(200))
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="new", nullable=False, index=True)
    match_scores: Mapped[dict] = mapped_column(JSON, default=dict)

    placements: Mapped[list["Placement"]] = relationship(back_populates="volunteer")
    documents: Mapped[list["Document"]] = relationship(back_populates="volunteer")
    comments: Mapped[list["Comment"]] = relationship(back_populates="volunteer")

    __table_args__ = (
        Index("ix_volunteers_tenant_id", "tenant_id"),
        Index("ix_volunteers_status", "status"),
    )


# ── PLACEMENT ─────────────────────────────────────────────────────────────────

class Placement(Base, TimestampMixin):
    __tablename__ = "placements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("placement_sites.id"), nullable=False)
    program_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    start_date: Mapped[datetime | None] = mapped_column(DateTime)
    end_date: Mapped[datetime | None] = mapped_column(DateTime)
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime)
    notes: Mapped[str | None] = mapped_column(Text)

    volunteer: Mapped["Volunteer"] = relationship(back_populates="placements")
    site: Mapped["PlacementSite"] = relationship(back_populates="placements")

    __table_args__ = (Index("ix_placements_tenant_id", "tenant_id"),)


# ── DOCUMENT ──────────────────────────────────────────────────────────────────

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    placement_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("placements.id"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    file_key: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(200), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="uploaded", nullable=False)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime)
    review_notes: Mapped[str | None] = mapped_column(Text)

    volunteer: Mapped["Volunteer"] = relationship(back_populates="documents")

    __table_args__ = (Index("ix_documents_tenant_id", "tenant_id"),)


# ── DOCUMENT REQUEST ──────────────────────────────────────────────────────────

class DocumentRequest(Base, TimestampMixin):
    __tablename__ = "document_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    document_name: Mapped[str] = mapped_column(String(200), nullable=False)
    mode: Mapped[str] = mapped_column(String(50), nullable=False)
    requested_by_site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("placement_sites.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (Index("ix_doc_requests_tenant_id", "tenant_id"),)


# ── COMMENT ───────────────────────────────────────────────────────────────────

class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    authored_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    authored_by_role: Mapped[str] = mapped_column(String(50), nullable=False)
    comment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    volunteer: Mapped["Volunteer"] = relationship(back_populates="comments")

    __table_args__ = (Index("ix_comments_tenant_id", "tenant_id"),)


# ── AUDIT LOG (append-only) ───────────────────────────────────────────────────

class AuditLog(Base):
    """
    Append-only audit log.
    Never update or delete rows — enforced by DB trigger in migration.
    """
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    before: Mapped[dict | None] = mapped_column(JSON)
    after: Mapped[dict | None] = mapped_column(JSON)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_audit_log_tenant_id", "tenant_id"),
        Index("ix_audit_log_entity", "entity_type", "entity_id"),
    )
