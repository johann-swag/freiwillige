"""
Zitadel JWT Validation
=======================
Verifies Bearer tokens issued by Zitadel.
Extracts tenant_id, user_id, role from claims.
"""

import httpx
import jwt
from functools import lru_cache

from app.core.config import settings


@lru_cache(maxsize=1)
def get_jwks_client():
    return jwt.PyJWKClient(
        f"http://{settings.ZITADEL_DOMAIN}/oauth/v2/keys"
    )


async def verify_jwt(token: str) -> dict:
    """
    Verify Zitadel JWT and return claims.
    Raises jwt.InvalidTokenError on failure.
    """
    jwks_client = get_jwks_client()
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=settings.ZITADEL_CLIENT_ID,
        options={"verify_exp": True},
    )

    return claims
