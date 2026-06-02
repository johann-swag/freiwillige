# CLAUDE.md — Freiwillig Platform

This file is the single source of truth for Claude Code.
Read this fully before making any changes.

## What this project is

Multi-tenant SaaS platform for NGO volunteer management.
Built to be self-hosted (open core, MIT) and sold as hosted service (Pro).

## Stack (all MIT/Apache 2.0 — commercially safe)

| Layer | Tool | Version |
|---|---|---|
| Backend | FastAPI + Pydantic v2 | Python 3.12 |
| Database | PostgreSQL 16 + Alembic | SQLAlchemy 2.0 async |
| Cache/Events | Valkey (Redis-compatible, MIT) | 7.2 |
| Auth | Zitadel | Apache 2.0 |
| Storage | Garage (S3-compatible, MIT) | v1.0 |
| Frontend | Next.js 14 + Tailwind | React 18 |
| Worker | Celery | 5.4 |
| Observability | OpenTelemetry + Signoz | MIT |

## Architecture principles — NEVER violate these

1. **tenant_id on everything** — every DB model has tenant_id, every query filters by it
2. **PostgreSQL RLS** — set via `SET LOCAL app.tenant_id = :tid` at request start
3. **Events not direct calls** — state changes emit to Valkey Streams, never call services directly
4. **Audit log is append-only** — never DELETE from audit_log
5. **Pydantic as single source of truth** — schemas in masterdata.py define everything
6. **No AGPL dependencies** — we sell this as SaaS, AGPL would require open-sourcing everything

## Project structure

```
freiwillig/
├── CLAUDE.md                    ← you are here
├── install.sh                   ← single-command installer
├── docker-compose.yml           ← full stack
├── .env.example                 ← env template
├── .woodpecker.yml              ← CI/CD pipeline
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py              ← FastAPI app, middleware, lifespan
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py  ← APIRouter with all sub-routers
│   │   │       └── endpoints/
│   │   │           ├── volunteers.py
│   │   │           ├── programs.py
│   │   │           ├── sites.py
│   │   │           ├── documents.py
│   │   │           ├── placements.py
│   │   │           ├── comments.py
│   │   │           └── tenants.py
│   │   ├── core/
│   │   │   ├── config.py        ← pydantic-settings, all env vars
│   │   │   ├── database.py      ← async engine, RLS helper
│   │   │   ├── events.py        ← Valkey Stream publisher
│   │   │   ├── auth.py          ← Zitadel JWT validation
│   │   │   └── deps.py          ← FastAPI dependencies (get_db, get_tenant, etc.)
│   │   ├── db/
│   │   │   └── migrations/      ← Alembic versions/
│   │   ├── models/
│   │   │   └── orm.py           ← SQLAlchemy ORM models (mirrors Pydantic schemas)
│   │   ├── schemas/
│   │   │   └── masterdata.py    ← ALL Pydantic schemas — single source of truth
│   │   ├── services/
│   │   │   ├── matching.py      ← volunteer ↔ site match scoring
│   │   │   ├── documents.py     ← S3 upload/download via Garage
│   │   │   └── notifications.py ← email + chat notifications
│   │   └── tasks/
│   │       ├── celery_app.py    ← Celery configuration
│   │       ├── matching.py      ← async match score recalculation
│   │       └── checkins.py      ← monthly check-in cron
│   └── tests/
│       ├── unit/
│       │   └── test_matching.py
│       └── integration/
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/                 ← Next.js 14 App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── (auth)/
│       │   │   └── login/
│       │   ├── (dashboard)/
│       │   │   ├── dashboard/
│       │   │   ├── volunteers/
│       │   │   ├── programs/
│       │   │   ├── sites/
│       │   │   └── documents/
│       │   └── (volunteer)/     ← volunteer-facing portal
│       │       ├── meine-bewerbung/
│       │       ├── stellen/
│       │       └── dokumente/
│       ├── components/
│       │   ├── ui/              ← shadcn/ui base components
│       │   ├── forms/           ← React Hook Form + Zod forms
│       │   └── layout/          ← Sidebar, Topbar, etc.
│       ├── lib/
│       │   ├── api.ts           ← typed API client (generated from OpenAPI)
│       │   └── auth.ts          ← Zitadel OIDC client
│       └── types/
│           └── api.ts           ← TypeScript types (generated from FastAPI)
│
├── seeds/
│   ├── programs.csv
│   ├── sites.csv
│   ├── document_types.csv
│   └── users.csv
│
└── docs/
    ├── adr/
    │   └── ADR-001-tech-stack.md
    └── ONBOARDING.md
```

## Current status

### Done ✓
- Pydantic masterdata schemas (all entities, enums, events)
- FastAPI app skeleton with middleware
- PostgreSQL + RLS database setup
- Valkey event publisher
- Matching service (language/focus/duration scoring)
- Volunteer API router (stubs)
- Celery app skeleton
- Docker Compose full stack
- Woodpecker CI/CD pipeline
- install.sh + seed CSVs + validator

### TODO — implement in this order

1. `backend/app/models/orm.py` — SQLAlchemy ORM models
2. `backend/db/migrations/` — Alembic first migration
3. `backend/app/core/auth.py` — Zitadel JWT validation
4. `backend/app/core/deps.py` — FastAPI dependency injection
5. `backend/app/api/v1/endpoints/*.py` — all endpoints (volunteers, programs, sites, documents)
6. `backend/app/services/documents.py` — Garage S3 integration
7. `frontend/` — Next.js app with Waldorf design

## Database models — implement these exactly

Every model MUST have:
- `id: UUID` (primary key)
- `tenant_id: UUID` (foreign key → tenants.id, indexed)
- `created_at: DateTime`
- `updated_at: DateTime`

Tables: tenants, users, programs, placement_sites, volunteers,
        placements, documents, document_requests, comments, audit_log

RLS policy pattern (add to every table except tenants):
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

## API conventions

- All routes prefixed `/api/v1/`
- Auth via Bearer JWT (Zitadel)
- tenant_id extracted from JWT claims, never from request body
- Pagination: `?page=1&page_size=20`
- Errors: `{"detail": "...", "code": "SNAKE_CASE_CODE"}`
- Dates: ISO 8601

## Volunteer status machine

```
NEW → QUALIFIED → IN_POOL → APPLIED → DOCS_PENDING →
DOCS_REVIEW → PLACED → ACTIVE → COMPLETED
         ↘ REJECTED (any stage)
         ↘ WITHDRAWN (any stage)
```

## Event names (Valkey Streams)

Stream key format: `freiwillig:{tenant_id}:{event_type}`

Events:
- `volunteer.qualified` — coordinator approved volunteer
- `volunteer.placed` — placement confirmed
- `document.uploaded` — volunteer uploaded document
- `document.approved` — admin approved document
- `document.rejected` — admin rejected, re-upload needed
- `document.requested` — site requested document from volunteer
- `placement.confirmed` — placement fully confirmed
- `checkin.due` — monthly check-in trigger
- `notification.email` — send email
- `notification.chat` — send Rocket.Chat message

## Matching score (0-100)

```python
language_match  = 50  # volunteer covers at least one required language at required CEFR level
focus_match     = 35  # at least one focus area overlaps
duration_match  = 15  # preferred duration matches site duration exactly
```

## Key files already written — do not rewrite

- `backend/app/schemas/masterdata.py` — complete, all schemas defined
- `backend/app/services/matching.py` — complete, tested
- `backend/app/core/config.py` — complete
- `backend/app/core/database.py` — complete
- `backend/app/core/events.py` — complete
- `backend/tests/unit/test_matching.py` — complete

## Fix needed immediately

`backend/requirements.txt` is missing `setuptools` which causes:
```
ModuleNotFoundError: No module named 'pkg_resources'
```
Add: `setuptools>=75.0.0`

## Design system (frontend)

Brand colors from freunde-waldorf.de:
- Primary orange: `#c8540a`
- Red-orange: `#d94f1e`
- Dark: `#1a1a18`
- Background: `#ffffff`

Fonts: Source Sans 3 (body), Playfair Display (headings)
Buttons: rounded pill shape, orange primary
Cards: white, 1px border, subtle shadow

Reference mockups in `frontend/src/mockups/`:
- `ngo-waldorf.jsx` — volunteer-facing portal (Freunde Waldorf design)
- `ngo-komplett.jsx` — coordinator dashboard (dark theme)
