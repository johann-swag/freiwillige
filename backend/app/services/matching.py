"""
Matching Service
=================
Calculates match score between a volunteer and a placement site.
Business logic stays in Python — not in n8n, not in the DB.

Score breakdown (max 100):
  Language match:  50 pts  (required language covered at required level)
  Focus match:     35 pts  (at least one interest overlaps)
  Duration match:  15 pts  (preferred duration matches site duration)
"""

import uuid
from dataclasses import dataclass

from app.schemas.masterdata import (
    MatchScoreResult,
    PlacementSiteDB,
    VolunteerDB,
)


@dataclass
class LanguageLevel:
    """Parse language string like 'es-B2' into lang + level."""
    code: str    # e.g. 'es', 'en', 'de'
    level: str   # e.g. 'A1', 'B2', 'C1', 'native'

    CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2", "native"]

    @classmethod
    def parse(cls, s: str) -> "LanguageLevel":
        parts = s.split("-", 1)
        return cls(code=parts[0].lower(), level=parts[1] if len(parts) > 1 else "A1")

    def meets_or_exceeds(self, required: "LanguageLevel") -> bool:
        """Check if this level meets or exceeds the required level."""
        if self.code != required.code:
            return False
        try:
            my_idx = self.CEFR_ORDER.index(self.level)
            req_idx = self.CEFR_ORDER.index(required.level)
            return my_idx >= req_idx
        except ValueError:
            return False


def calculate_match_score(
    volunteer: VolunteerDB,
    site: PlacementSiteDB,
) -> MatchScoreResult:
    breakdown: dict[str, int] = {
        "language_match": 0,
        "focus_match": 0,
        "duration_match": 0,
    }

    # ── Language (50 pts) ─────────────────────────────────────────────────────
    volunteer_langs = [LanguageLevel.parse(l) for l in volunteer.languages]
    for required_str in site.required_languages:
        required = LanguageLevel.parse(required_str)
        if any(vl.meets_or_exceeds(required) for vl in volunteer_langs):
            breakdown["language_match"] = 50
            break

    # ── Focus area (35 pts) ───────────────────────────────────────────────────
    volunteer_interests = set(volunteer.focus_interests)
    site_focus = set(site.focus_areas)
    if volunteer_interests & site_focus:
        breakdown["focus_match"] = 35

    # ── Duration (15 pts) ─────────────────────────────────────────────────────
    if volunteer.preferred_duration == site.duration_months:
        breakdown["duration_match"] = 15

    total = sum(breakdown.values())

    return MatchScoreResult(
        volunteer_id=volunteer.id,
        site_id=site.id,
        score=total,
        breakdown=breakdown,
    )


async def calculate_pool_scores(
    volunteer: VolunteerDB,
    sites: list[PlacementSiteDB],
) -> list[MatchScoreResult]:
    """Score a volunteer against all available sites, sorted descending."""
    results = [calculate_match_score(volunteer, site) for site in sites]
    return sorted(results, key=lambda r: r.score, reverse=True)
