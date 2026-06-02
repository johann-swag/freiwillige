"""
Application Configuration
==========================
All config from environment variables.
Never hardcode secrets.
"""

from typing import Literal
from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ──────────────────────────────────────────────────────────────────
    ENV: Literal["development", "staging", "production"] = "development"
    VERSION: str = "0.1.0"
    SECRET_KEY: str = Field(min_length=32)
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: PostgresDsn
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # ── Valkey (Redis-compatible) ─────────────────────────────────────────────
    VALKEY_URL: RedisDsn = "redis://valkey:6379/0"

    # ── Zitadel (Auth) ───────────────────────────────────────────────────────
    ZITADEL_DOMAIN: str
    ZITADEL_CLIENT_ID: str
    ZITADEL_CLIENT_SECRET: str
    ZITADEL_PROJECT_ID: str

    # ── Garage (S3-compatible storage) ───────────────────────────────────────
    GARAGE_ENDPOINT: str = "http://garage:3900"
    GARAGE_ACCESS_KEY: str
    GARAGE_SECRET_KEY: str
    GARAGE_BUCKET: str = "freiwillig-documents"

    # ── Email ─────────────────────────────────────────────────────────────────
    SMTP_HOST: str = "mailpit"
    SMTP_PORT: int = 1025
    SMTP_FROM: str = "noreply@freiwillig.app"
    SMTP_TLS: bool = False

    # ── OpenTelemetry ─────────────────────────────────────────────────────────
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://signoz-otel-collector:4317"
    OTEL_SERVICE_NAME: str = "freiwillig-api"

    # ── Feature Flags (Unleash) ────────────────────────────────────────────────
    UNLEASH_URL: str = "http://unleash:4242/api"
    UNLEASH_API_TOKEN: str = ""

    # ── Celery ────────────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://valkey:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://valkey:6379/2"


settings = Settings()
