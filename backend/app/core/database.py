"""
Database — PostgreSQL with Row Level Security
=============================================
RLS is the second line of defense after application-level tenant_id filtering.
Even if application code has a bug, the DB will not return cross-tenant data.
"""

import uuid
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


engine = create_async_engine(
    str(settings.DATABASE_URL),
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.ENV == "development",
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def set_tenant_rls(conn, tenant_id: uuid.UUID) -> None:
    """
    Set PostgreSQL session variable used by RLS policies.
    Must be called at the start of every request with a tenant context.

    SQL policies defined in migration (see alembic/versions/):
      CREATE POLICY tenant_isolation ON volunteers
        USING (tenant_id = current_setting('app.tenant_id')::uuid);
    """
    await conn.execute(
        text("SET LOCAL app.tenant_id = :tenant_id"),
        {"tenant_id": str(tenant_id)},
    )
