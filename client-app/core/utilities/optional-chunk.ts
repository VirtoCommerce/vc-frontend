const ignored = new WeakSet<object>();

/**
 * Marks a failed dynamic import as one the call site already handles by degrading — an optional
 * plugin, a locale bundle that falls back — so the global chunk-load recovery leaves it alone.
 *
 * Vite dispatches `vite:preloadError` for every failed dynamic import, then rethrows the same error
 * instance it put on the event. Claiming that instance identifies the one failure exactly, with no
 * matching on chunk URLs.
 *
 * Kept free of imports so any layer can claim a failure without pulling the recovery module, and its
 * notification dependencies, into that layer's chunk.
 */
export function ignoreChunkLoadFailure(error: unknown): void {
  if (error !== null && typeof error === "object") {
    ignored.add(error);
  }
}

export function isIgnoredChunkLoadFailure(error: unknown): boolean {
  return error !== null && typeof error === "object" && ignored.has(error);
}
