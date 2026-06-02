# ADR-001: Tech Stack Selection

**Date:** 2026-06-02  
**Status:** Accepted  
**Deciders:** Johannes

---

## Context

We are building a multi-tenant volunteer management SaaS platform for NGOs.
Requirements:
- Self-hostable by the NGO (open core)
- Sellable as hosted service by us (commercial)
- All dependencies must be MIT/Apache 2.0/BSD — no AGPL or Sustainable Use in the critical path
- Must run on a single Proxmox host initially (Beelink SER8, 64GB RAM)

## Decision

### Frontend: Next.js + Tailwind CSS (MIT)
Next.js is the logical continuation of our React mockups. 
TypeScript types generated from FastAPI OpenAPI spec — no manual duplication.

### Backend: FastAPI + Pydantic (MIT)
FastAPI chosen over Django because:
- Pydantic schemas are the single source of truth (models, validation, API docs, TypeScript types)
- Async-native — better performance for I/O-heavy workloads
- OpenAPI auto-generation without plugins

### Database: PostgreSQL 16 + Alembic (PostgreSQL License / MIT)
- Row Level Security enforced at DB level for tenant isolation
- Alembic for versioned migrations
- NocoDB sits on top as admin UI (AGPL — only internal, never customer-facing)

### Auth: Zitadel (Apache 2.0)
Chosen over Keycloak because:
- ~200MB RAM vs Keycloak's 512MB+
- Multi-tenancy built-in
- Better developer experience
- Apache 2.0 — commercially safe

### Task Queue: Celery + Valkey (BSD + MIT)
- Celery for background jobs (match score calculation, email sending)
- Valkey (MIT Redis fork by Linux Foundation) instead of Redis (changed to RSALv2 in v7.4)
- Valkey is a drop-in replacement

### Storage: Garage (MIT)
- S3-compatible object storage
- Chosen over MinIO (AGPL) for commercial safety
- Lighter weight, simpler configuration

### API Gateway: Traefik (MIT)
Already familiar from Proxmox setup.
Handles SSL, rate limiting, routing, middleware.

### CI/CD: Gitea + Woodpecker CI (MIT + Apache 2.0)
- Gitea: self-hosted Git, MIT licensed
- Woodpecker CI: GitHub Actions-compatible syntax, Apache 2.0
- Both run on Proxmox LXC

### Observability: OpenTelemetry + Signoz (Apache 2.0 + MIT)
- OpenTelemetry: standard instrumentation, vendor-neutral
- Signoz: all-in-one (metrics, traces, logs), MIT, self-hosted
- Chosen over Grafana (AGPL) for commercial safety

### NOT chosen: n8n
n8n uses Sustainable Use License which explicitly prohibits providing it as a hosted service to third parties. Since we plan to sell hosted instances, n8n is incompatible.
Business logic stays in Python. Event-driven communication via Valkey Streams.

## Consequences

**Positive:**
- 100% commercially safe stack
- All components self-hostable
- Strong typed API contract (OpenAPI → TypeScript)
- Tenant isolation enforced at multiple layers

**Negative:**
- More initial setup than n8n-based approach
- Woodpecker CI less mature than GitHub Actions
- Zitadel less documentation than Keycloak

## License Summary

| Tool | License | Commercial SaaS |
|---|---|---|
| Next.js | MIT | ✓ |
| FastAPI | MIT | ✓ |
| PostgreSQL | PostgreSQL | ✓ |
| Valkey | MIT | ✓ |
| Celery | BSD | ✓ |
| Zitadel | Apache 2.0 | ✓ |
| Garage | MIT | ✓ |
| Traefik | MIT | ✓ |
| Gitea | MIT | ✓ |
| Woodpecker CI | Apache 2.0 | ✓ |
| Signoz | MIT | ✓ |
| OpenTelemetry | Apache 2.0 | ✓ |
