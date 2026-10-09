/** On a placeholder route: the owning plugin's name. Kept apart from declare.ts so bootstrap can read it cheaply. */
export const PLACEHOLDER_META_KEY = "pluginPlaceholder";

/** How long a deep link waits on its plugin before the placeholder says it is slow and offers a reload. */
export const PLACEHOLDER_SLOW_NOTICE_MS = 5_000;
