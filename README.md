# Freiwillig — Volunteer Management Platform

Self-hosted, multi-tenant SaaS for volunteer organizations.  
Built to be sold as a hosted service.

## Stack

| Layer | Tool | License |
|---|---|---|
| Frontend | Next.js + Tailwind | MIT |
| API Gateway | Traefik | MIT |
| Backend | FastAPI + Pydantic | MIT |
| Task Queue | Celery + Valkey | BSD + MIT |
| Database | PostgreSQL + Alembic | PostgreSQL / MIT |
| Auth / IAM | Zitadel | Apache 2.0 |
| Storage | Garage (S3) | MIT |
| Git | Gitea | MIT |
| CI/CD | Woodpecker CI | Apache 2.0 |
| Observability | OpenTelemetry + Signoz | Apache 2.0 / MIT |
| Docs | MkDocs Material | MIT |

## Architecture Principles

1. **Tenant isolation first** — every query carries `tenant_id`, enforced by PostgreSQL RLS
2. **Event-driven** — state changes emit events to Valkey Streams, never direct service-to-service calls
3. **OpenAPI as contract** — FastAPI auto-generates, frontend consumes typed client
4. **Audit log always** — every status change is append-only in `audit_log`
5. **Feature flags** — Pro features gated via Unleash per tenant

## Quickstart

```bash
cp .env.example .env
docker compose up -d
```

Services:
- Frontend:     http://localhost:3000
- API:          http://localhost:8000/docs
- Traefik:      http://localhost:8080
- Zitadel:      http://localhost:8081
- Signoz:       http://localhost:3301
- Mailpit:      http://localhost:8025

## Project Structure

```
freiwillig/
├── backend/          FastAPI application
├── frontend/         Next.js application
├── infrastructure/   Docker, Traefik, CI/CD configs
├── docs/             MkDocs, ADRs, process docs
└── scripts/          Dev utilities, seed data
```

## License

Core: MIT  
Pro features: Proprietary
