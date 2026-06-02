"""
Celery Application
===================
Background task queue using Valkey as broker.
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "freiwillig",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.matching",
        "app.tasks.checkins",
        "app.tasks.notifications",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Berlin",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# ── Scheduled tasks ───────────────────────────────────────────────────────────
celery_app.conf.beat_schedule = {
    # Monthly check-in reminders — 1st of each month at 08:00
    "monthly-checkin-reminder": {
        "task": "app.tasks.checkins.send_checkin_reminders",
        "schedule": crontab(hour=8, minute=0, day_of_month=1),
    },
    # Recalculate match scores nightly
    "nightly-match-scores": {
        "task": "app.tasks.matching.recalculate_all_scores",
        "schedule": crontab(hour=2, minute=0),
    },
}
