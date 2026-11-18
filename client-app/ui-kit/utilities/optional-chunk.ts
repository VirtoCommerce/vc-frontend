const ignored = new WeakSet<object>();

/**
 * Marks a failed dynamic import the call site already handles by degrading, so the chunk-load recovery
 * leaves it alone. Vite rethrows the same error instance it puts on `vite:preloadError`, so claiming
 * that instance identifies the one failure exactly.
 */
export function ignoreChunkLoadFailure(error: unknown): void {
  if (error !== null && typeof error === "object") {
    ignored.add(error);
  }
}

export function isIgnoredChunkLoadFailure(error: unknown): boolean {
  return error !== null && typeof error === "object" && ignored.has(error);
}
