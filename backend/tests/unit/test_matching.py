"""
Tests — Matching Service
=========================
Business logic must be fully tested. No DB, no network.
"""

import uuid
from datetime import date

import pytest

from app.schemas.masterdata import (
    DurationMonths,
    FocusArea,
    PlacementSiteDB,
    VolunteerDB,
    VolunteerStatus,
)
from app.services.matching import LanguageLevel, calculate_match_score


# ─── FIXTURES ─────────────────────────────────────────────────────────────────

def make_volunteer(**overrides) -> VolunteerDB:
    defaults = dict(
        id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        first_name="Test",
        last_name="Volunteer",
        email="test@example.com",
        date_of_birth=date(2002, 1, 1),
        nationality="DE",
        languages=["de-native", "en-C1", "es-B2"],
        focus_interests=[FocusArea.EDUCATION, FocusArea.ECOLOGY],
        available_from=date(2026, 7, 1),
        preferred_duration=DurationMonths.TWELVE,
        status=VolunteerStatus.IN_POOL,
        match_scores={},
        created_at=date.today(),
        updated_at=date.today(),
    )
    defaults.update(overrides)
    return VolunteerDB(**defaults)


def make_site(**overrides) -> PlacementSiteDB:
    defaults = dict(
        id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        name="Test Site",
        program_id=uuid.uuid4(),
        country="GH",
        city="Accra",
        contact_name="Contact",
        contact_email="contact@site.org",
        focus_areas=[FocusArea.EDUCATION],
        required_languages=["en-B2"],
        capacity=4,
        duration_months=DurationMonths.TWELVE,
        spots_available=2,
        created_at=date.today(),
        updated_at=date.today(),
    )
    defaults.update(overrides)
    return PlacementSiteDB(**defaults)


# ─── LANGUAGE LEVEL TESTS ─────────────────────────────────────────────────────

class TestLanguageLevel:
    def test_parse_with_level(self):
        ll = LanguageLevel.parse("es-B2")
        assert ll.code == "es"
        assert ll.level == "B2"

    def test_parse_native(self):
        ll = LanguageLevel.parse("de-native")
        assert ll.code == "de"
        assert ll.level == "native"

    def test_meets_equal_level(self):
        volunteer = LanguageLevel.parse("es-B2")
        required = LanguageLevel.parse("es-B2")
        assert volunteer.meets_or_exceeds(required) is True

    def test_meets_higher_level(self):
        volunteer = LanguageLevel.parse("es-C1")
        required = LanguageLevel.parse("es-B2")
        assert volunteer.meets_or_exceeds(required) is True

    def test_does_not_meet_lower_level(self):
        volunteer = LanguageLevel.parse("es-A2")
        required = LanguageLevel.parse("es-B2")
        assert volunteer.meets_or_exceeds(required) is False

    def test_native_meets_all(self):
        volunteer = LanguageLevel.parse("de-native")
        required = LanguageLevel.parse("de-C2")
        assert volunteer.meets_or_exceeds(required) is True

    def test_wrong_language(self):
        volunteer = LanguageLevel.parse("es-C1")
        required = LanguageLevel.parse("en-B2")
        assert volunteer.meets_or_exceeds(required) is False


# ─── MATCH SCORE TESTS ────────────────────────────────────────────────────────

class TestMatchScore:
    def test_perfect_match(self):
        volunteer = make_volunteer(
            languages=["en-C1", "es-B2"],
            focus_interests=[FocusArea.EDUCATION],
            preferred_duration=DurationMonths.TWELVE,
        )
        site = make_site(
            required_languages=["en-B2"],
            focus_areas=[FocusArea.EDUCATION],
            duration_months=DurationMonths.TWELVE,
        )
        result = calculate_match_score(volunteer, site)
        assert result.score == 100
        assert result.breakdown["language_match"] == 50
        assert result.breakdown["focus_match"] == 35
        assert result.breakdown["duration_match"] == 15

    def test_language_mismatch(self):
        volunteer = make_volunteer(languages=["de-native"])
        site = make_site(required_languages=["es-B2"])
        result = calculate_match_score(volunteer, site)
        assert result.breakdown["language_match"] == 0
        assert result.score < 50

    def test_focus_mismatch(self):
        volunteer = make_volunteer(focus_interests=[FocusArea.ECOLOGY])
        site = make_site(focus_areas=[FocusArea.HEALTH])
        result = calculate_match_score(volunteer, site)
        assert result.breakdown["focus_match"] == 0

    def test_duration_mismatch(self):
        volunteer = make_volunteer(preferred_duration=DurationMonths.SIX)
        site = make_site(duration_months=DurationMonths.TWELVE)
        result = calculate_match_score(volunteer, site)
        assert result.breakdown["duration_match"] == 0

    def test_zero_match(self):
        volunteer = make_volunteer(
            languages=["de-native"],
            focus_interests=[FocusArea.ECOLOGY],
            preferred_duration=DurationMonths.SIX,
        )
        site = make_site(
            required_languages=["es-B2"],
            focus_areas=[FocusArea.HEALTH],
            duration_months=DurationMonths.TWELVE,
        )
        result = calculate_match_score(volunteer, site)
        assert result.score == 0

    def test_score_capped_at_100(self):
        volunteer = make_volunteer()
        site = make_site()
        result = calculate_match_score(volunteer, site)
        assert 0 <= result.score <= 100

    def test_result_has_correct_ids(self):
        volunteer = make_volunteer()
        site = make_site()
        result = calculate_match_score(volunteer, site)
        assert result.volunteer_id == volunteer.id
        assert result.site_id == site.id
