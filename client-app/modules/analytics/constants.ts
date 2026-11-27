export const MODULE_ID = "VirtoCommerce.Analytics";
export const ENABLED_KEY = "Analytics.Enabled";
export const COLLECT_ANONYMOUS_KEY = "Analytics.CollectAnonymous";

export const TRACKER_NAME = "analytics";
export const DEBUG_PREFIX = "[Analytics]";

export const SESSION_STORAGE_KEY = "vc-analytics-session";
export const SESSION_IDENTITY_STORAGE_KEY = "vc-analytics-session-identity";

export const SESSION_START_EVENT = "session_start";

/**
 * What the platform stores in this version. Sign-ins are missing on purpose: the platform records them itself, with
 * the failures and their reasons, where the browser sees neither a resumed session nor a sign-in on someone's behalf.
 */
export const COLLECTED_EVENTS: ReadonlySet<string> = new Set([
  "$pageview",
  SESSION_START_EVENT,
  "search",
  "view_search_results",
  "view_item",
  "add_to_cart",
  "update_cart_item",
]);

/** The backend reads this many events of a request and ignores the rest. */
export const MAX_BATCH_SIZE = 50;

/** Long enough to put the events of one navigation into one request, short enough to lose little on a closed tab. */
export const FLUSH_DELAY_MS = 1000;

/** Under the backend's limit of 16,384 characters for an event's properties. */
export const MAX_PROPERTIES_LENGTH = 16_000;

/** A failed batch is offered once more, then dropped: an unreachable backend must not grow the queue forever. */
export const MAX_SEND_ATTEMPTS = 2;
