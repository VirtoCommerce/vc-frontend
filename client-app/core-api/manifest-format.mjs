/**
 * The two facts about contributions.json that both sides must agree on. Plain JS with no imports, so
 * manifest.mjs (the plugin's build, node) and the host's loader (the browser) share one source.
 */
export const CONTRIBUTIONS_FILE_NAME = "contributions.json";
export const CONTRIBUTIONS_FORMAT = 1;
