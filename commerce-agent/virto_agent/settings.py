"""Deployment settings read from the environment once at import.

Nothing here is a credential for a customer: ``XAPI_ENDPOINT`` and the store defaults are
deployment facts, and the per-customer bearer arrives with each request and lives only on
that request's :class:`~virto_agent.context.VirtoSessionContext`.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    xapi_endpoint: str
    store_id: str
    currency_code: str
    culture_name: str
    request_timeout_s: float

    @classmethod
    def from_env(cls) -> Settings:
        base = os.environ.get("XAPI_ENDPOINT", "https://vcst-qa.govirto.com").rstrip("/")
        return cls(
            xapi_endpoint=base if base.endswith("/graphql") else f"{base}/graphql",
            store_id=os.environ.get("XAPI_STORE_ID", "B2B-store"),
            currency_code=os.environ.get("XAPI_CURRENCY_CODE", "USD"),
            culture_name=os.environ.get("XAPI_CULTURE_NAME", "en-US"),
            request_timeout_s=float(os.environ.get("XAPI_TIMEOUT_S", "30")),
        )
