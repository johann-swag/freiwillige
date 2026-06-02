"""
Masterdata Schemas — Single Source of Truth
============================================
These Pydantic models define every entity in the system.
- Used for API request/response validation
- Used for OpenAPI documentation (auto-generated)
- Used for DB model alignment (via SQLAlchemy)
- Used as reference for frontend TypeScript types (generated)

Naming convention:
  <Entity>Base      — shared fields
  <Entity>Create    — POST body (no id, no timestamps)
  <Entity>Update    — PATCH body (all optional)
  <Entity>DB        — what's stored (includes id, timestamps, tenant_id)
  <Entity>Public    — what the API returns (may omit sensitive fields)
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import Enum
from typing import Annotated, Optional

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator


# ─── SHARED ──────────────────────────────────────────────────────────────────

TenantId = Annotated[uuid.UUID, Field(description="Tenant (NGO organisation) identifier")]
EntityId = Annotated[uuid.UUID, Field(default_factory=uuid.uuid4)]


class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TenantMixin(BaseModel):
    tenant_id: TenantId


# ─── ENUMS ───────────────────────────────────────────────────────────────────

class VolunteerStatus(str, Enum):
    """Lifecycle state of a volunteer application."""
    NEW           = "new"           # just registered
    QUALIFIED     = "qualified"     # reviewed, eligible for pool
    IN_POOL       = "in_pool"       # can browse and apply to placements
    APPLIED       = "applied"       # applied to placement(s)
    DOCS_PENDING  = "docs_pending"  # placement tentative, awaiting documents
    DOCS_REVIEW   = "docs_review"   # documents uploaded, under review
    PLACED        = "placed"        # placement confirmed, all docs approved
    ACTIVE        = "active"        # volunteer is currently on placement
    COMPLETED     = "completed"     # placement finished
    REJECTED      = "rejected"      # application rejected at any stage
    WITHDRAWN     = "withdrawn"     # volunteer withdrew


class PlacementStatus(str, Enum):
    """State of a specific placement (volunteer ↔ site assignment)."""
    PENDING    = "pending"
    CONFIRMED  = "confirmed"
    ACTIVE     = "active"
    COMPLETED  = "completed"
    CANCELLED  = "cancelled"


class DocumentStatus(str, Enum):
    PENDING   = "pending"    # not yet uploaded
    UPLOADED  = "uploaded"   # uploaded, awaiting review
    APPROVED  = "approved"   # reviewed and approved
    REJECTED  = "rejected"   # rejected, re-upload required


class DocumentSource(str, Enum):
    VOLUNTEER    = "volunteer"    # uploaded by volunteer
    SITE         = "site"         # uploaded by placement site
    ADMIN        = "admin"        # uploaded by NGO admin


class DocumentRequestMode(str, Enum):
    DIRECT       = "direct"       # site requests directly → notified immediately
    VIA_ADMIN    = "via_admin"    # request queued for admin approval first


class ProgramStatus(str, Enum):
    PLANNED    = "planned"
    ACTIVE     = "active"
    COMPLETED  = "completed"
    CANCELLED  = "cancelled"


class CommentType(str, Enum):
    RECOMMENDATION = "recommendation"
    CONCERN        = "concern"
    INFO           = "info"


class AuditAction(str, Enum):
    """Every action that is audit-logged."""
    VOLUNTEER_STATUS_CHANGED   = "volunteer.status_changed"
    DOCUMENT_UPLOADED          = "document.uploaded"
    DOCUMENT_APPROVED          = "document.approved"
    DOCUMENT_REJECTED          = "document.rejected"
    DOCUMENT_REQUESTED         = "document.requested"
    DOCUMENT_REQUEST_APPROVED  = "document.request_approved"
    DOCUMENT_REQUEST_BLOCKED   = "document.request_blocked"
    PLACEMENT_CREATED          = "placement.created"
    PLACEMENT_CONFIRMED        = "placement.confirmed"
    PLACEMENT_CANCELLED        = "placement.cancelled"
    COMMENT_ADDED              = "comment.added"
    ADMIN_STATUS_OVERRIDE      = "admin.status_override"
    TENANT_CREATED             = "tenant.created"
    USER_INVITED               = "user.invited"


class EventType(str, Enum):
    """Events emitted to Valkey Streams."""
    VOLUNTEER_QUALIFIED        = "volunteer.qualified"
    VOLUNTEER_PLACED           = "volunteer.placed"
    DOCUMENT_UPLOADED          = "document.uploaded"
    DOCUMENT_APPROVED          = "document.approved"
    DOCUMENT_REJECTED          = "document.rejected"
    DOCUMENT_REQUESTED         = "document.requested"
    PLACEMENT_CONFIRMED        = "placement.confirmed"
    CHECKIN_DUE                = "checkin.due"
    NOTIFICATION_EMAIL         = "notification.email"
    NOTIFICATION_CHAT          = "notification.chat"


class UserRole(str, Enum):
    SUPER_ADMIN   = "super_admin"   # platform operator
    ORG_ADMIN     = "org_admin"     # NGO coordinator
    SITE_MANAGER  = "site_manager"  # placement site contact
    VOLUNTEER     = "volunteer"     # applicant / active volunteer


class ServiceType(str, Enum):
    """Type of volunteer service program."""
    FSJ      = "fsj"      # Freiwilliges Soziales Jahr
    FOJ      = "foj"      # Freiwilliges Ökologisches Jahr
    BFD      = "bfd"      # Bundesfreiwilligendienst
    WELTWAERTS = "weltwaerts"
    IJFD     = "ijfd"     # Internationaler Jugendfreiwilligendienst
    OTHER    = "other"


class FocusArea(str, Enum):
    EDUCATION      = "education"
    ECOLOGY        = "ecology"
    SOCIAL         = "social"
    HEALTH         = "health"
    AGRICULTURE    = "agriculture"
    CULTURE        = "culture"
    OTHER          = "other"


class DurationMonths(int, Enum):
    THREE  = 3
    SIX    = 6
    NINE   = 9
    TWELVE = 12
    EIGHTEEN = 18


# ─── TENANT ──────────────────────────────────────────────────────────────────

class TenantBase(BaseModel):
    name: str = Field(min_length=2, max_length=200, description="Organisation name")
    slug: str = Field(min_length=2, max_length=50, pattern=r"^[a-z0-9-]+$", description="URL-safe identifier")
    contact_email: EmailStr
    website: Optional[HttpUrl] = None
    country: str = Field(max_length=2, description="ISO 3166-1 alpha-2")
    logo_url: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantDB(TenantBase, TimestampMixin):
    id: EntityId
    is_active: bool = True
    plan: str = "core"  # core | pro


class TenantPublic(TenantBase):
    id: uuid.UUID
    plan: str
    is_active: bool


# ─── USER ────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    role: UserRole
    language: str = Field(default="de", max_length=5)


class UserCreate(UserBase):
    """Used when inviting a new user. Password set via Zitadel flow."""
    site_id: Optional[uuid.UUID] = Field(
        default=None,
        description="Required when role=site_manager"
    )


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserDB(UserBase, TenantMixin, TimestampMixin):
    id: EntityId
    zitadel_user_id: str = Field(description="External IAM reference")
    site_id: Optional[uuid.UUID] = None
    is_active: bool = True


class UserPublic(UserBase):
    id: uuid.UUID
    site_id: Optional[uuid.UUID] = None
    is_active: bool


# ─── PROGRAM ─────────────────────────────────────────────────────────────────

class ProgramBase(BaseModel):
    name: str = Field(max_length=200)
    service_type: ServiceType
    focus_areas: list[FocusArea] = Field(min_length=1)
    country: str = Field(max_length=2, description="ISO 3166-1 alpha-2 — target country")
    start_date: date
    end_date: date
    status: ProgramStatus = ProgramStatus.PLANNED
    description: Optional[str] = None

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        if "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class ProgramCreate(ProgramBase):
    coordinator_id: uuid.UUID


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ProgramStatus] = None
    description: Optional[str] = None
    end_date: Optional[date] = None


class ProgramDB(ProgramBase, TenantMixin, TimestampMixin):
    id: EntityId
    coordinator_id: uuid.UUID


class ProgramPublic(ProgramBase):
    id: uuid.UUID
    coordinator_id: uuid.UUID
    site_count: int = 0
    volunteer_count: int = 0


# ─── PLACEMENT SITE ───────────────────────────────────────────────────────────

class PlacementSiteBase(BaseModel):
    name: str = Field(max_length=200)
    program_id: uuid.UUID
    country: str = Field(max_length=2)
    city: str = Field(max_length=100)
    address: Optional[str] = None
    contact_name: str = Field(max_length=200)
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    focus_areas: list[FocusArea] = Field(min_length=1)
    required_languages: list[str] = Field(
        min_length=1,
        description="e.g. ['es-B2', 'en-C1']"
    )
    capacity: int = Field(ge=1, le=50)
    duration_months: DurationMonths
    description: Optional[str] = None
    formbricks_form_id: Optional[str] = Field(
        default=None,
        description="Formbricks form ID for site-specific application form"
    )
    rocket_channel: Optional[str] = Field(
        default=None,
        description="Rocket.Chat channel slug for this site"
    )


class PlacementSiteCreate(PlacementSiteBase):
    pass


class PlacementSiteUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    formbricks_form_id: Optional[str] = None


class PlacementSiteDB(PlacementSiteBase, TenantMixin, TimestampMixin):
    id: EntityId
    spots_available: int  # computed: capacity - active placements


class PlacementSitePublic(PlacementSiteBase):
    id: uuid.UUID
    spots_available: int
    match_score: Optional[int] = Field(
        default=None,
        description="0-100, computed against requesting volunteer's profile"
    )


# ─── VOLUNTEER ───────────────────────────────────────────────────────────────

class VolunteerProfileBase(BaseModel):
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: EmailStr
    date_of_birth: date
    nationality: str = Field(max_length=2, description="ISO 3166-1 alpha-2")
    languages: list[str] = Field(
        min_length=1,
        description="e.g. ['de-native', 'en-C1', 'es-B2']"
    )
    focus_interests: list[FocusArea] = Field(min_length=1)
    available_from: date
    preferred_duration: DurationMonths
    motivation: Optional[str] = Field(default=None, max_length=2000)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    @field_validator("date_of_birth")
    @classmethod
    def must_be_adult(cls, v: date) -> date:
        from datetime import date as d
        age = (d.today() - v).days / 365.25
        if age < 16 or age > 30:
            raise ValueError("Volunteer must be between 16 and 30 years old")
        return v


class VolunteerCreate(VolunteerProfileBase):
    pass


class VolunteerUpdate(BaseModel):
    languages: Optional[list[str]] = None
    focus_interests: Optional[list[FocusArea]] = None
    available_from: Optional[date] = None
    preferred_duration: Optional[DurationMonths] = None
    motivation: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class VolunteerDB(VolunteerProfileBase, TenantMixin, TimestampMixin):
    id: EntityId
    user_id: uuid.UUID = Field(description="Links to UserDB")
    status: VolunteerStatus = VolunteerStatus.NEW
    match_scores: dict[str, int] = Field(
        default_factory=dict,
        description="site_id -> score (0-100), cached"
    )


class VolunteerPublic(VolunteerProfileBase):
    id: uuid.UUID
    status: VolunteerStatus
    placement_applications: list[uuid.UUID] = []
    documents: list["DocumentPublic"] = []


# ─── PLACEMENT ───────────────────────────────────────────────────────────────

class PlacementBase(BaseModel):
    volunteer_id: uuid.UUID
    site_id: uuid.UUID
    program_id: uuid.UUID
    priority: int = Field(ge=1, le=2, description="1=first choice, 2=second choice")
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PlacementCreate(PlacementBase):
    pass


class PlacementUpdate(BaseModel):
    status: Optional[PlacementStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class PlacementDB(PlacementBase, TenantMixin, TimestampMixin):
    id: EntityId
    status: PlacementStatus = PlacementStatus.PENDING
    confirmed_by: Optional[uuid.UUID] = None
    confirmed_at: Optional[datetime] = None
    notes: Optional[str] = None


class PlacementPublic(PlacementBase):
    id: uuid.UUID
    status: PlacementStatus
    confirmed_at: Optional[datetime] = None


# ─── DOCUMENT ────────────────────────────────────────────────────────────────

class DocumentBase(BaseModel):
    name: str = Field(max_length=200)
    document_type: str = Field(
        max_length=100,
        description="e.g. 'cv', 'motivation_letter', 'criminal_record', 'health_certificate'"
    )
    source: DocumentSource
    volunteer_id: uuid.UUID
    placement_id: Optional[uuid.UUID] = None


class DocumentCreate(DocumentBase):
    file_key: str = Field(description="Garage S3 object key")
    file_name: str
    file_size_bytes: int
    mime_type: str


class DocumentRequestCreate(BaseModel):
    """Site requests a document from a volunteer."""
    volunteer_id: uuid.UUID
    document_type: str
    document_name: str
    mode: DocumentRequestMode
    requested_by_site_id: uuid.UUID
    notes: Optional[str] = None


class DocumentRequestDB(TenantMixin, TimestampMixin):
    id: EntityId
    volunteer_id: uuid.UUID
    document_type: str
    document_name: str
    mode: DocumentRequestMode
    requested_by_site_id: uuid.UUID
    status: str = "pending"  # pending | approved | blocked | fulfilled
    approved_by: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class DocumentDB(DocumentBase, TenantMixin, TimestampMixin):
    id: EntityId
    file_key: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    status: DocumentStatus = DocumentStatus.UPLOADED
    reviewed_by: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None


class DocumentPublic(DocumentBase):
    id: uuid.UUID
    file_name: str
    status: DocumentStatus
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None


# ─── COMMENT ─────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    volunteer_id: uuid.UUID
    comment_type: CommentType
    text: str = Field(min_length=1, max_length=2000)


class CommentDB(TenantMixin, TimestampMixin):
    id: EntityId
    volunteer_id: uuid.UUID
    authored_by: uuid.UUID
    authored_by_role: UserRole
    comment_type: CommentType
    text: str


class CommentPublic(BaseModel):
    id: uuid.UUID
    authored_by_role: UserRole
    comment_type: CommentType
    text: str
    created_at: datetime


# ─── AUDIT LOG ───────────────────────────────────────────────────────────────

class AuditLogEntry(TenantMixin):
    """Append-only. Never updated or deleted."""
    id: EntityId
    action: AuditAction
    actor_id: uuid.UUID
    actor_role: UserRole
    entity_type: str       # e.g. "volunteer", "document", "placement"
    entity_id: uuid.UUID
    before: Optional[dict] = None   # state before change
    after: Optional[dict] = None    # state after change
    metadata: dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── EVENTS (Valkey Streams) ─────────────────────────────────────────────────

class DomainEvent(BaseModel):
    """Base for all events emitted to Valkey Streams."""
    event_id: EntityId
    event_type: EventType
    tenant_id: uuid.UUID
    actor_id: uuid.UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    payload: dict


class VolunteerQualifiedEvent(DomainEvent):
    event_type: EventType = EventType.VOLUNTEER_QUALIFIED


class DocumentUploadedEvent(DomainEvent):
    event_type: EventType = EventType.DOCUMENT_UPLOADED


class PlacementConfirmedEvent(DomainEvent):
    event_type: EventType = EventType.PLACEMENT_CONFIRMED


# ─── MATCHING ────────────────────────────────────────────────────────────────

class MatchScoreResult(BaseModel):
    """Result of matching a volunteer against a placement site."""
    volunteer_id: uuid.UUID
    site_id: uuid.UUID
    score: int = Field(ge=0, le=100)
    breakdown: dict[str, int] = Field(
        description={
            "language_match": "0 or 50",
            "focus_match": "0 or 35",
            "duration_match": "0 or 15",
        }
    )


# ─── API RESPONSES ───────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    pages: int


class HealthCheck(BaseModel):
    status: str = "ok"
    version: str
    tenant_id: Optional[uuid.UUID] = None


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None


# Update forward refs
VolunteerPublic.model_rebuild()
