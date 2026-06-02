"""
FastAPI Dependencies
=====================
Injected into every endpoint that needs auth or DB access.
"""

import uuid
from typing import Annotated

import structlog
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_jwt
from app.core.database import AsyncSessionLocal, set_tenant_rls
from app.schemas.masterdata import UserRole

logger = structlog.get_logger()
security = HTTPBearer()


# ── DATABASE ──────────────────────────────────────────────────────────────────

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


# ── AUTH ──────────────────────────────────────────────────────────────────────

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Validates Zitadel JWT and returns claims dict.
    Sets PostgreSQL RLS for the tenant.
    """
    token = credentials.credentials

    try:
        claims = await verify_jwt(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    tenant_id = claims.get("tenant_id")
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token missing tenant_id claim",
        )

    # Set RLS for this request
    async with db.begin():
        await set_tenant_rls(db, uuid.UUID(tenant_id))

    return claims


async def get_current_tenant_id(
    claims: Annotated[dict, Depends(get_current_user)],
) -> uuid.UUID:
    return uuid.UUID(claims["tenant_id"])


async def get_current_user_id(
    claims: Annotated[dict, Depends(get_current_user)],
) -> uuid.UUID:
    return uuid.UUID(claims["sub"])


async def get_current_role(
    claims: Annotated[dict, Depends(get_current_user)],
) -> UserRole:
    role = claims.get("role", "volunteer")
    return UserRole(role)


# ── ROLE GUARDS ───────────────────────────────────────────────────────────────

def require_role(*allowed_roles: UserRole):
    async def check(
        role: Annotated[UserRole, Depends(get_current_role)],
    ):
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {role} not permitted for this action",
            )
        return role
    return check


RequireAdmin = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN))
RequireSiteOrAdmin = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER))


# ── TYPE ALIASES (cleaner endpoint signatures) ────────────────────────────────

DB = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[dict, Depends(get_current_user)]
TenantId = Annotated[uuid.UUID, Depends(get_current_tenant_id)]
UserId = Annotated[uuid.UUID, Depends(get_current_user_id)]
Role = Annotated[UserRole, Depends(get_current_role)]
