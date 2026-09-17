"""The session context the backend acts on, and the exception for a caller who is no
longer signed in.

The bearer rides on the context for the duration of one request and is never stored: the
storefront already holds a valid token for every call it makes, and sends it with each
request, so nothing here has to refresh a credential or keep one at rest. A session id on
its own therefore authorizes nothing — resuming a session needs the token too, and the
service checks that the token resolves to the same principal the session was started for.

``docs/backends.md`` names this shape: "a per-customer token: put it on a subclass of the
session context".
"""

from __future__ import annotations

from pydantic import Field
from shopping_agent import ShoppingSessionContext


class VirtoSessionContext(ShoppingSessionContext):
    # repr=False so a traceback or a logged model never carries the token.
    access_token: str = Field(repr=False)


class SessionSignedOut(Exception):
    """The request carried no usable credential for this session.

    The executor maps it to a line asking the customer to sign in again rather than to a
    system outage, so the model does not offer to retry.
    """
