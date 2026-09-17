export const MODULE_ID = "VirtoCommerce.CommerceAgent";

/**
 * The agent runs as its own service beside x-api, so the module is enabled by pointing at it
 * rather than by a platform store setting: there is no backend module to carry one yet.
 * The dev server proxies this path (see vite.config.ts).
 */
export const AGENT_BASE_URL = import.meta.env.APP_AGENT_URL ?? "/agent-api";

export const SESSION_HEADER = "X-Session-Id";
