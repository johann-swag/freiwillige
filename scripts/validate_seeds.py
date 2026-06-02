#!/usr/bin/env python3
"""
Seed Validator — Runs before seeding to catch errors early.
==============================================================
Checks:
  - All required columns present
  - Slugs are URL-safe
  - Dates are valid ISO format
  - Enum values are valid
  - Cross-references are consistent (site.program_slug → programs.csv)
  - No duplicate slugs within a file
  - Email formats valid
  - Language codes format correct

Exit code 0 = valid, 1 = errors found.
"""

import csv
import re
import sys
from datetime import date, datetime
from pathlib import Path

# ── Colours ──────────────────────────────────────────────────────────────────
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
CYAN = "\033[0;36m"
BOLD = "\033[1m"
NC = "\033[0m"


def ok(msg):    print(f"  {GREEN}✓{NC}  {msg}")
def warn(msg):  print(f"  {YELLOW}!{NC}  {msg}")
def fail(msg):  print(f"  {RED}✗{NC}  {msg}")


# ── Validators ────────────────────────────────────────────────────────────────

VALID_SERVICE_TYPES = {"fsj", "foj", "bfd", "weltwaerts", "ijfd", "other"}
VALID_FOCUS_AREAS = {"education", "ecology", "social", "health", "agriculture", "culture", "other"}
VALID_STATUSES = {"planned", "active", "completed", "cancelled"}
VALID_ROLES = {"org_admin", "site_manager"}
VALID_REQUIRED_AT = {"application", "placement", "pre_departure"}
VALID_REQUESTED_BY = {"admin", "site", "site_direct"}
VALID_DURATIONS = {"3", "6", "9", "12", "18"}
VALID_CEFR = {"A1", "A2", "B1", "B2", "C1", "C2", "native"}

SLUG_RE = re.compile(r"^[a-z0-9-]+$")
EMAIL_RE = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
LANG_RE = re.compile(r"^[a-z]{2}-(A1|A2|B1|B2|C1|C2|native)$")


def is_slug(s: str) -> bool:
    return bool(SLUG_RE.match(s))

def is_email(s: str) -> bool:
    return bool(EMAIL_RE.match(s))

def is_date(s: str) -> bool:
    try:
        datetime.strptime(s, "%Y-%m-%d")
        return True
    except ValueError:
        return False

def is_lang(s: str) -> bool:
    return bool(LANG_RE.match(s))


def read_csv(path: Path) -> list[dict]:
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(
            (line for line in f if not line.strip().startswith("#"))
        )
        for row in reader:
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows


# ── File Validators ───────────────────────────────────────────────────────────

def validate_programs(path: Path) -> tuple[bool, set[str]]:
    print(f"\n{BOLD}programs.csv{NC}")
    required_cols = {"slug", "name", "service_type", "focus_areas", "country",
                     "start_date", "end_date", "status", "coordinator_email"}
    errors = 0
    slugs = set()

    try:
        rows = read_csv(path)
    except Exception as e:
        fail(f"Could not read file: {e}")
        return False, set()

    if not rows:
        warn("File is empty")
        return True, set()

    # Check columns
    missing_cols = required_cols - set(rows[0].keys())
    if missing_cols:
        fail(f"Missing columns: {missing_cols}")
        errors += 1

    for i, row in enumerate(rows, 1):
        row_errors = []

        if not row.get("slug"):
            row_errors.append("slug is empty")
        elif not is_slug(row["slug"]):
            row_errors.append(f"slug '{row['slug']}' is not URL-safe (lowercase letters, numbers, hyphens only)")
        elif row["slug"] in slugs:
            row_errors.append(f"duplicate slug: {row['slug']}")
        else:
            slugs.add(row["slug"])

        if row.get("service_type") not in VALID_SERVICE_TYPES:
            row_errors.append(f"invalid service_type: '{row.get('service_type')}'. Valid: {VALID_SERVICE_TYPES}")

        for fa in row.get("focus_areas", "").split(","):
            fa = fa.strip()
            if fa and fa not in VALID_FOCUS_AREAS:
                row_errors.append(f"invalid focus_area: '{fa}'")

        if not is_date(row.get("start_date", "")):
            row_errors.append(f"invalid start_date: '{row.get('start_date')}' (use YYYY-MM-DD)")

        if not is_date(row.get("end_date", "")):
            row_errors.append(f"invalid end_date: '{row.get('end_date')}' (use YYYY-MM-DD)")

        if row.get("status") not in VALID_STATUSES:
            row_errors.append(f"invalid status: '{row.get('status')}'")

        if not is_email(row.get("coordinator_email", "")):
            row_errors.append(f"invalid coordinator_email: '{row.get('coordinator_email')}'")

        if row_errors:
            for e in row_errors:
                fail(f"Row {i} ({row.get('slug', '?')}): {e}")
            errors += len(row_errors)

    if errors == 0:
        ok(f"{len(rows)} programmes valid")
    return errors == 0, slugs


def validate_sites(path: Path, program_slugs: set[str]) -> tuple[bool, set[str]]:
    print(f"\n{BOLD}sites.csv{NC}")
    required_cols = {"slug", "name", "program_slug", "country", "city",
                     "contact_name", "contact_email", "focus_areas",
                     "required_languages", "capacity", "duration_months"}
    errors = 0
    slugs = set()

    try:
        rows = read_csv(path)
    except Exception as e:
        fail(f"Could not read file: {e}")
        return False, set()

    if not rows:
        warn("File is empty")
        return True, set()

    missing_cols = required_cols - set(rows[0].keys())
    if missing_cols:
        fail(f"Missing columns: {missing_cols}")
        errors += 1

    for i, row in enumerate(rows, 1):
        row_errors = []

        if not is_slug(row.get("slug", "")):
            row_errors.append(f"invalid slug: '{row.get('slug')}'")
        elif row["slug"] in slugs:
            row_errors.append(f"duplicate slug: {row['slug']}")
        else:
            slugs.add(row["slug"])

        ps = row.get("program_slug", "")
        if program_slugs and ps not in program_slugs:
            row_errors.append(f"program_slug '{ps}' not found in programs.csv")

        if not is_email(row.get("contact_email", "")):
            row_errors.append(f"invalid contact_email: '{row.get('contact_email')}'")

        try:
            cap = int(row.get("capacity", "0"))
            if cap < 1 or cap > 100:
                row_errors.append(f"capacity must be 1-100, got {cap}")
        except ValueError:
            row_errors.append(f"capacity must be a number, got: '{row.get('capacity')}'")

        if row.get("duration_months") not in VALID_DURATIONS:
            row_errors.append(f"invalid duration_months: '{row.get('duration_months')}'. Valid: {VALID_DURATIONS}")

        for lang in row.get("required_languages", "").split(","):
            lang = lang.strip()
            if lang and not is_lang(lang):
                row_errors.append(f"invalid language code: '{lang}' (expected format: es-B2, en-C1, de-native)")

        if row_errors:
            for e in row_errors:
                fail(f"Row {i} ({row.get('slug', '?')}): {e}")
            errors += len(row_errors)

    if errors == 0:
        ok(f"{len(rows)} sites valid")
    return errors == 0, slugs


def validate_document_types(path: Path) -> bool:
    print(f"\n{BOLD}document_types.csv{NC}")
    required_cols = {"key", "name_de", "name_en", "required_at", "scope",
                     "requested_by", "max_size_mb"}
    errors = 0
    keys = set()

    try:
        rows = read_csv(path)
    except Exception as e:
        fail(f"Could not read file: {e}")
        return False

    missing_cols = required_cols - set(rows[0].keys())
    if missing_cols:
        fail(f"Missing columns: {missing_cols}")
        errors += 1

    for i, row in enumerate(rows, 1):
        row_errors = []

        key = row.get("key", "")
        if not re.match(r"^[a-z_]+$", key):
            row_errors.append(f"key must be lowercase with underscores: '{key}'")
        elif key in keys:
            row_errors.append(f"duplicate key: {key}")
        else:
            keys.add(key)

        if row.get("required_at") not in VALID_REQUIRED_AT:
            row_errors.append(f"invalid required_at: '{row.get('required_at')}'")

        if row.get("requested_by") not in VALID_REQUESTED_BY:
            row_errors.append(f"invalid requested_by: '{row.get('requested_by')}'")

        try:
            size = int(row.get("max_size_mb", "0"))
            if size < 1 or size > 100:
                row_errors.append(f"max_size_mb must be 1-100")
        except ValueError:
            row_errors.append(f"max_size_mb must be a number")

        if row_errors:
            for e in row_errors:
                fail(f"Row {i} ({key}): {e}")
            errors += len(row_errors)

    if errors == 0:
        ok(f"{len(rows)} document types valid")
    return errors == 0


def validate_users(path: Path, site_slugs: set[str]) -> bool:
    print(f"\n{BOLD}users.csv{NC}")
    required_cols = {"email", "first_name", "last_name", "role"}
    errors = 0
    emails = set()

    try:
        rows = read_csv(path)
    except Exception as e:
        fail(f"Could not read file: {e}")
        return False

    missing_cols = required_cols - set(rows[0].keys())
    if missing_cols:
        fail(f"Missing columns: {missing_cols}")
        return False

    for i, row in enumerate(rows, 1):
        row_errors = []

        if not is_email(row.get("email", "")):
            row_errors.append(f"invalid email: '{row.get('email')}'")
        elif row["email"] in emails:
            row_errors.append(f"duplicate email: {row['email']}")
        else:
            emails.add(row["email"])

        if row.get("role") not in VALID_ROLES:
            row_errors.append(f"invalid role: '{row.get('role')}'. Valid: {VALID_ROLES}")

        if row.get("role") == "site_manager":
            site = row.get("site_slug", "")
            if not site:
                row_errors.append("site_slug is required when role=site_manager")
            elif site_slugs and site not in site_slugs:
                row_errors.append(f"site_slug '{site}' not found in sites.csv")

        if row_errors:
            for e in row_errors:
                fail(f"Row {i} ({row.get('email', '?')}): {e}")
            errors += len(row_errors)

    if errors == 0:
        ok(f"{len(rows)} users valid")
    return errors == 0


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: validate_seeds.py <seeds-dir>")
        sys.exit(1)

    seeds_dir = Path(sys.argv[1])
    print(f"\n{BOLD}Validating seed files in: {seeds_dir}{NC}")

    all_valid = True

    # Programs
    programs_path = seeds_dir / "programs.csv"
    if programs_path.exists():
        valid, program_slugs = validate_programs(programs_path)
        all_valid = all_valid and valid
    else:
        fail("programs.csv not found")
        program_slugs = set()
        all_valid = False

    # Sites (cross-reference programs)
    sites_path = seeds_dir / "sites.csv"
    if sites_path.exists():
        valid, site_slugs = validate_sites(sites_path, program_slugs)
        all_valid = all_valid and valid
    else:
        fail("sites.csv not found")
        site_slugs = set()
        all_valid = False

    # Document types
    doc_path = seeds_dir / "document_types.csv"
    if doc_path.exists():
        valid = validate_document_types(doc_path)
        all_valid = all_valid and valid
    else:
        warn("document_types.csv not found — skipping")

    # Users (cross-reference sites)
    users_path = seeds_dir / "users.csv"
    if users_path.exists():
        valid = validate_users(users_path, site_slugs)
        all_valid = all_valid and valid
    else:
        warn("users.csv not found — skipping")

    print()
    if all_valid:
        print(f"{GREEN}{BOLD}All seed files valid ✓{NC}\n")
        sys.exit(0)
    else:
        print(f"{RED}{BOLD}Validation failed — fix errors above before installing{NC}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
