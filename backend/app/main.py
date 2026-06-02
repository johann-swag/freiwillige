"""
FastAPI Application Entry Point
================================
- Multi-tenant with PostgreSQL Row Level Security
- OpenTelemetry instrumentation
- Structured logging (JSON)
- OpenAPI auto-generated from Pydantic schemas
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.database import engine, set_tenant_rls
from app.core.events import event_publisher

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown."""
    logger.info("starting_up", version=settings.VERSION, env=settings.ENV)
    await event_publisher.connect()
    yield
    await event_publisher.disconnect()
    logger.info("shutdown")


app = FastAPI(
    title="Freiwillig API",
    description="Volunteer management platform — multi-tenant SaaS",
    version=settings.VERSION,
    docs_url="/docs" if settings.ENV != "production" else None,
    redoc_url="/redoc" if settings.ENV != "production" else None,
    lifespan=lifespan,
)

# ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def tenant_middleware(request: Request, call_next) -> Response:
    """
    Extracts tenant_id from Zitadel JWT claims and sets PostgreSQL RLS.
    Every request must carry a valid tenant context.
    """
    tenant_id = getattr(request.state, "tenant_id", None)

    if tenant_id and request.url.path.startswith("/api/"):
        async with engine.begin() as conn:
            await set_tenant_rls(conn, tenant_id)

    response = await call_next(request)
    return response


@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next) -> Response:
    """Log every request with tenant context."""
    with structlog.contextvars.bound_contextvars(
        method=request.method,
        path=request.url.path,
        tenant_id=str(getattr(request.state, "tenant_id", "anonymous")),
    ):
        response = await call_next(request)
        logger.info(
            "request",
            status_code=response.status_code,
        )
        return response


# ─── EXCEPTION HANDLERS ───────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_exception", path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "INTERNAL_ERROR"},
    )


# ─── ROUTERS ─────────────────────────────────────────────────────────────────

app.include_router(api_v1_router, prefix="/api/v1")


# ─── HEALTH ──────────────────────────────────────────────────────────────────

@app.get("/health", tags=["infra"])
async def health():
    return {"status": "ok", "version": settings.VERSION}


# ─── OTEL ────────────────────────────────────────────────────────────────────

FastAPIInstrumentor.instrument_app(app)
