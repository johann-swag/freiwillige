#!/usr/bin/env python3
"""
Seeder — Reads CSV files and seeds the database via the internal API.
=========================================================================
Called by install.sh — not meant to be run directly by customers.

Usage:
  python3 seed.py --seeds-dir /app/seeds --org-slug freunde-waldorf ...

On conflict behaviour is controlled by SEED_ON_CONFLICT in tenant.env:
  skip    — log and continue (default, safe for re-runs)
  update  — PATCH existing record
  replace — DELETE + POST (destructive)
"""

import argparse
import csv
import json
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import httpx

BASE_URL = "http://localhost:8000/api/v1"
ON_CONFLICT = os.getenv("SEED_ON_CONFLICT", "skip")


# ── Colours ──────────────────────────────────────────────────────────────────
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
RED = "\033[0;31m"
CYAN = "\033[0;36m"
NC = "\033[0m"
BOLD = "\033[1m"


def log(msg):   print(f"{GREEN}[✓]{NC} {msg}")
def info(msg):  print(f"{CYAN}[→]{NC} {msg}")
def warn(msg):  print(f"{YELLOW}[!]{NC} {msg}")
def err(msg):   print(f"{RED}[✗]{NC} {msg}"); sys.exit(1)


# ── HTTP Client ───────────────────────────────────────────────────────────────

def get_client() -> httpx.Client:
    """Internal API client — no auth needed for seeding (runs inside container)."""
    return httpx.Client(
        base_url=BASE_URL,
        headers={"X-Seed-Token": os.getenv("SEED_TOKEN", "internal")},
        timeout=30,
    )


def upsert(client: httpx.Client, endpoint: str, slug: str, payload: dict) -> dict:
    """Create or update depending on ON_CONFLICT setting."""
    # Try GET first
    resp = client.get(f"{endpoint}/{slug}")

    if resp.status_code == 404:
        # Create
        r = client.post(endpoint, json=payload)
        if r.status_code not in (200, 201):
            err(f"POST {endpoint} failed: {r.status_code} — {r.text}")
        log(f"Created {endpoint}/{slug}")
        return r.json()

    if resp.status_code == 200:
        if ON_CONFLICT == "skip":
            info(f"Skipped {endpoint}/{slug} (already exists)")
            return resp.json()
        elif ON_CONFLICT == "update":
            r = client.patch(f"{endpoint}/{slug}", json=payload)
            if r.status_code != 200:
                err(f"PATCH {endpoint}/{slug} failed: {r.status_code} — {r.text}")
            log(f"Updated {endpoint}/{slug}")
            return r.json()
        elif ON_CONFLICT == "replace":
            client.delete(f"{endpoint}/{slug}")
            r = client.post(endpoint, json=payload)
            if r.status_code not in (200, 201):
                err(f"POST {endpoint}/{slug} (replace) failed: {r.status_code}")
            log(f"Replaced {endpoint}/{slug}")
            return r.json()

    err(f"Unexpected status {resp.status_code} for {endpoint}/{slug}")


# ── CSV Parsing ───────────────────────────────────────────────────────────────

def read_csv(path: Path) -> list[dict]:
    """Read CSV, skip comment lines starting with #, strip whitespace."""
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(
            (line for line in f if not line.strip().startswith("#")),
        )
        for row in reader:
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows


def parse_list(value: str) -> list[str]:
    """Parse comma-separated string into list, filtering empty strings."""
    return [v.strip() for v in value.split(",") if v.strip()]


def parse_bool(value: str) -> bool:
    return value.lower() in ("true", "1", "yes")


# ── Seeders ───────────────────────────────────────────────────────────────────

def seed_programs(client: httpx.Client, seeds_dir: Path, coordinator_id: str):
    path = seeds_dir / "programs.csv"
    if not path.exists():
        warn("programs.csv not found — skipping")
        return

    info(f"Seeding programmes from {path}")
    rows = read_csv(path)

    for row in rows:
        payload = {
            "slug": row["slug"],
            "name": row["name"],
            "service_type": row["service_type"],
            "focus_areas": parse_list(row["focus_areas"]),
            "country": row["country"].upper(),
            "start_date": row["start_date"],
            "end_date": row["end_date"],
            "status": row.get("status", "planned"),
            "description": row.get("description", ""),
            "coordinator_id": coordinator_id,
        }
        upsert(client, "/programs", row["slug"], payload)

    log(f"Programmes: {len(rows)} processed")


def seed_sites(client: httpx.Client, seeds_dir: Path):
    path = seeds_dir / "sites.csv"
    if not path.exists():
        warn("sites.csv not found — skipping")
        return

    info(f"Seeding sites from {path}")
    rows = read_csv(path)

    for row in rows:
        payload = {
            "slug": row["slug"],
            "name": row["name"],
            "program_slug": row["program_slug"],
            "country": row["country"].upper(),
            "city": row["city"],
            "address": row.get("address", ""),
            "contact_name": row["contact_name"],
            "contact_email": row["contact_email"],
            "contact_phone": row.get("contact_phone", ""),
            "focus_areas": parse_list(row["focus_areas"]),
            "required_languages": parse_list(row["required_languages"]),
            "capacity": int(row["capacity"]),
            "duration_months": int(row["duration_months"]),
            "formbricks_form_id": row.get("formbricks_form_id", "") or None,
            "rocket_channel": row.get("rocket_channel", "") or None,
            "description": row.get("description", ""),
        }
        upsert(client, "/sites", row["slug"], payload)

    log(f"Sites: {len(rows)} processed")


def seed_document_types(client: httpx.Client, seeds_dir: Path):
    path = seeds_dir / "document_types.csv"
    if not path.exists():
        warn("document_types.csv not found — skipping")
        return

    info(f"Seeding document types from {path}")
    rows = read_csv(path)

    for row in rows:
        payload = {
            "key": row["key"],
            "name": {"de": row["name_de"], "en": row["name_en"]},
            "description": {
                "de": row.get("description_de", ""),
                "en": row.get("description_en", ""),
            },
            "required_at": row["required_at"],
            "scope": parse_list(row["scope"]),
            "requested_by": row["requested_by"],
            "max_size_mb": int(row.get("max_size_mb", 5)),
            "accepted_formats": parse_list(row.get("accepted_formats", "application/pdf")),
        }
        upsert(client, "/document-types", row["key"], payload)

    log(f"Document types: {len(rows)} processed")


def seed_users(
    client: httpx.Client,
    seeds_dir: Path,
    org_slug: str,
):
    path = seeds_dir / "users.csv"
    if not path.exists():
        warn("users.csv not found — skipping")
        return

    info(f"Seeding users from {path}")
    rows = read_csv(path)

    for row in rows:
        payload = {
            "email": row["email"],
            "first_name": row["first_name"],
            "last_name": row["last_name"],
            "role": row["role"],
            "site_slug": row.get("site_slug", "") or None,
            "language": row.get("language", "de"),
            "send_invite": parse_bool(row.get("send_invite", "true")),
        }
        # Use email as slug for users
        slug = row["email"].replace("@", "-at-").replace(".", "-")
        upsert(client, "/users", slug, payload)

    log(f"Users: {len(rows)} processed")


def seed_tenant(
    client: httpx.Client,
    org_name: str,
    org_slug: str,
    admin_email: str,
    admin_first_name: str,
    admin_last_name: str,
) -> str:
    """Create or verify the tenant record. Returns the admin user ID."""
    info(f"Setting up tenant: {org_name} ({org_slug})")

    payload = {
        "name": org_name,
        "slug": org_slug,
        "contact_email": admin_email,
    }

    r = client.get(f"/tenants/{org_slug}")
    if r.status_code == 404:
        r = client.post("/tenants", json=payload)
        if r.status_code not in (200, 201):
            err(f"Could not create tenant: {r.text}")
        log(f"Tenant created: {org_slug}")
    else:
        log(f"Tenant already exists: {org_slug}")

    tenant_data = r.json()

    # Get or create admin user
    admin_slug = admin_email.replace("@", "-at-").replace(".", "-")
    r2 = client.get(f"/users/{admin_slug}")
    if r2.status_code == 404:
        admin_payload = {
            "email": admin_email,
            "first_name": admin_first_name,
            "last_name": admin_last_name,
            "role": "org_admin",
            "send_invite": False,
        }
        r2 = client.post("/users", json=admin_payload)
        if r2.status_code not in (200, 201):
            err(f"Could not create admin user: {r2.text}")
        log(f"Admin user created: {admin_email}")
    else:
        log(f"Admin user exists: {admin_email}")

    return r2.json().get("id", "")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Freiwillig Seeder")
    parser.add_argument("--seeds-dir", required=True)
    parser.add_argument("--org-name", required=True)
    parser.add_argument("--org-slug", required=True)
    parser.add_argument("--admin-email", required=True)
    parser.add_argument("--admin-first-name", required=True)
    parser.add_argument("--admin-last-name", required=True)
    args = parser.parse_args()

    seeds_dir = Path(args.seeds_dir)
    if not seeds_dir.exists():
        err(f"Seeds directory not found: {seeds_dir}")

    print(f"\n{BOLD}Freiwillig Seeder{NC}")
    print(f"Org: {args.org_name} ({args.org_slug})")
    print(f"Seeds: {seeds_dir}\n")

    client = get_client()

    # 1. Tenant + admin user
    admin_id = seed_tenant(
        client,
        org_name=args.org_name,
        org_slug=args.org_slug,
        admin_email=args.admin_email,
        admin_first_name=args.admin_first_name,
        admin_last_name=args.admin_last_name,
    )

    # 2. Programmes
    seed_programs(client, seeds_dir, coordinator_id=admin_id)

    # 3. Sites (depend on programmes)
    seed_sites(client, seeds_dir)

    # 4. Document types
    seed_document_types(client, seeds_dir)

    # 5. Additional users
    seed_users(client, seeds_dir, org_slug=args.org_slug)

    print(f"\n{GREEN}{BOLD}Seeding complete!{NC}\n")


if __name__ == "__main__":
    main()
