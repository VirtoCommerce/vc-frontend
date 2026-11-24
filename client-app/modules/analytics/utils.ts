/** `randomUUID` exists only in a secure context; `getRandomValues` exists everywhere. */
export function createId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
}
