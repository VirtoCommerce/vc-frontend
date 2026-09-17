"""A shopping agent for a Virto Commerce storefront, on the ``anthropics/commerce-agents``
reference packages.

The reference supplies the prompt, tool contracts, gates, grounding, presentation, memory
and the turn loop; this module supplies the four things a deployment owns — the backend
over x-api, the config, the executor's own failure mapping, and the service that hosts it.
The decision record is in the repository's ``CLAUDE.md``.
"""

from .backend import NeedsConfiguration, VirtoStorefrontBackend
from .config import build_shopping_config
from .context import SessionSignedOut, VirtoSessionContext
from .executor import VirtoShoppingExecutor
from .session_store import SqliteSessionStore
from .settings import Settings

__all__ = [
    "NeedsConfiguration",
    "SessionSignedOut",
    "Settings",
    "SqliteSessionStore",
    "VirtoSessionContext",
    "VirtoShoppingExecutor",
    "VirtoStorefrontBackend",
    "build_shopping_config",
]
