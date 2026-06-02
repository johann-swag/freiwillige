"""
Event Publisher — Valkey Streams
==================================
All state changes emit events. Consumers (Celery tasks, notification workers)
subscribe independently. No direct service-to-service calls.

Stream naming: freiwillig:{tenant_id}:{event_type}
Consumer groups: notifications, audit, integrations
"""

import json
from typing import Any

import redis.asyncio as redis
import structlog

from app.core.config import settings
from app.schemas.masterdata import DomainEvent

logger = structlog.get_logger()


class EventPublisher:
    def __init__(self):
        self._client: redis.Redis | None = None

    async def connect(self) -> None:
        self._client = redis.from_url(str(settings.VALKEY_URL), decode_responses=True)
        logger.info("event_publisher_connected")

    async def disconnect(self) -> None:
        if self._client:
            await self._client.aclose()
            logger.info("event_publisher_disconnected")

    async def publish(self, event: DomainEvent) -> str:
        """
        Publish event to tenant-scoped Valkey Stream.
        Returns the stream entry ID.
        """
        if not self._client:
            raise RuntimeError("EventPublisher not connected")

        stream_key = f"freiwillig:{event.tenant_id}:{event.event_type.value}"
        payload = {
            "event_id": str(event.event_id),
            "event_type": event.event_type.value,
            "tenant_id": str(event.tenant_id),
            "actor_id": str(event.actor_id),
            "timestamp": event.timestamp.isoformat(),
            "payload": json.dumps(event.payload),
        }

        entry_id = await self._client.xadd(stream_key, payload, maxlen=10_000)
        logger.info(
            "event_published",
            stream=stream_key,
            event_type=event.event_type.value,
            entry_id=entry_id,
        )
        return entry_id

    async def publish_raw(
        self,
        tenant_id: str,
        event_type: str,
        payload: dict[str, Any],
    ) -> str:
        """Convenience method for simple events."""
        stream_key = f"freiwillig:{tenant_id}:{event_type}"
        entry = {"payload": json.dumps(payload), "event_type": event_type}
        return await self._client.xadd(stream_key, entry, maxlen=10_000)


event_publisher = EventPublisher()
