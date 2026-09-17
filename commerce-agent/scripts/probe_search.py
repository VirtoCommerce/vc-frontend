"""Send each kind-word both ways against live x-api and print what comes back.

No model call and no Anthropic key: this reads the store only, so it is free to run and
is the check to repeat whenever the catalog, the index or the resolver moves.

    cd commerce-agent && PYTHONPATH=. .venv/bin/python scripts/probe_search.py [kind ...]
"""

from __future__ import annotations

import asyncio
import sys

import httpx
from dotenv import load_dotenv
from shopping_agent import NotOffered, SearchFilters

from evals.harness import storefront_token
from virto_agent.backend import UnknownCategory, VirtoStorefrontBackend
from virto_agent.context import VirtoSessionContext
from virto_agent.settings import Settings
from virto_agent.xapi import XapiClient

KINDS = ["printers", "bolts", "soft drinks", "juice", "laptops", "helmets", "beverages"]
LIMIT = 20


async def main(kinds: list[str]) -> None:
    load_dotenv(".env")
    settings = Settings.from_env()
    async with httpx.AsyncClient(timeout=settings.request_timeout_s) as http:
        token = await storefront_token(settings, http)
    session = VirtoSessionContext(session_id="probe", user_id="probe", access_token=token)

    client = XapiClient(settings.xapi_endpoint, timeout=settings.request_timeout_s)
    try:
        backend = VirtoStorefrontBackend(client=client, settings=settings)
        for kind in kinds:
            as_text = await backend.search_products(session, kind, limit=LIMIT)
            try:
                found = await backend.search_products(
                    session, "", SearchFilters(category=kind), limit=LIMIT
                )
                as_category = f"{len(found):>2}  {found[0].title[:44] if found else ''}"
            except UnknownCategory as unknown:
                names = ", ".join(unknown.candidates[:3]) or "(no near names either)"
                as_category = f"no such category -> {names}"
            print(f"{kind:<14} text {len(as_text):>2}   category {as_category}")

        try:
            await backend.search_products(session, "", SearchFilters())
        except NotOffered as refused:
            print(f"\nneither text nor filter: refused, {refused}")
        else:
            print("\nneither text nor filter: ANSWERED - the first-page guard is gone")
    finally:
        await client.aclose()


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:] or KINDS))
