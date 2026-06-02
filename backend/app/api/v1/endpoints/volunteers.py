"""
Volunteer API — v1
===================
All endpoints are tenant-scoped.
RLS enforced at DB level (belt AND suspenders).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.events import event_publisher
from app.schemas.masterdata import (
    AuditAction,
    DomainEvent,
    EventType,
    PaginatedResponse,
    PlacementSiteDB,
    VolunteerCreate,
    VolunteerDB,
    VolunteerPublic,
    VolunteerStatus,
    VolunteerUpdate,
)
from app.services.matching import calculate_pool_scores

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


# ─── HELPERS (replace with real DB queries) ───────────────────────────────────

async def get_volunteer_or_404(
    volunteer_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> VolunteerDB:
    """Fetch volunteer, enforcing tenant scope."""
    # Real implementation: SELECT * FROM volunteers WHERE id=:id AND tenant_id=:tid
    # RLS also enforces this at DB level
    raise HTTPException(status_code=404, detail="Volunteer not found")


# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=VolunteerPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new volunteer application",
)
async def create_volunteer(
    body: VolunteerCreate,
    db: AsyncSession = Depends(get_db),
    # tenant_id: uuid.UUID = Depends(get_current_tenant),  # from Zitadel JWT
    # actor_id: uuid.UUID = Depends(get_current_user_id),
) -> VolunteerPublic:
    """
    Create a new volunteer record.
    Status starts as NEW — coordinator must qualify them.
    Emits: volunteer.status_changed event
    """
    # 1. Validate + persist to DB
    # 2. Emit event
    # 3. Return public representation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get(
    "/",
    response_model=PaginatedResponse,
    summary="List volunteers (coordinator view)",
)
async def list_volunteers(
    status: VolunteerStatus | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse:
    """List all volunteers for this tenant, filterable by status."""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get(
    "/{volunteer_id}",
    response_model=VolunteerPublic,
    summary="Get volunteer detail",
)
async def get_volunteer(
    volunteer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> VolunteerPublic:
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch(
    "/{volunteer_id}",
    response_model=VolunteerPublic,
    summary="Update volunteer profile",
)
async def update_volunteer(
    volunteer_id: uuid.UUID,
    body: VolunteerUpdate,
    db: AsyncSession = Depends(get_db),
) -> VolunteerPublic:
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post(
    "/{volunteer_id}/qualify",
    response_model=VolunteerPublic,
    summary="Qualify volunteer — grants access to placement pool",
)
async def qualify_volunteer(
    volunteer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> VolunteerPublic:
    """
    Coordinator action: moves volunteer from NEW → IN_POOL.
    Triggers:
    - Email notification to volunteer
    - Match scores calculated async (Celery task)
    - Audit log entry
    - Event published to Valkey Stream
    """
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post(
    "/{volunteer_id}/status-override",
    response_model=VolunteerPublic,
    summary="Admin override volunteer status",
)
async def override_status(
    volunteer_id: uuid.UUID,
    new_status: VolunteerStatus,
    reason: str,
    db: AsyncSession = Depends(get_db),
) -> VolunteerPublic:
    """
    Verwaltung can override status at any point.
    Always audit-logged with reason.
    """
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get(
    "/{volunteer_id}/match-scores",
    response_model=list,
    summary="Get match scores for all available sites",
)
async def get_match_scores(
    volunteer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns sorted list of placement sites with match scores.
    Used to power the volunteer's pool view.
    Scores are cached in volunteer.match_scores, refreshed async.
    """
    raise HTTPException(status_code=501, detail="Not implemented")
