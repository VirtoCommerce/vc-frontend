const STORAGE_PREFIX = "ucp-handoff:";

// Only an opaque, tab-local reference travels through sign-in and external IdP URLs.
export function saveUcpContinuation(session: string): string {
  const reference = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_PREFIX + reference, session);
  return reference;
}

export function readUcpContinuation(reference: string): string | null {
  return sessionStorage.getItem(STORAGE_PREFIX + reference);
}

export function removeUcpContinuation(reference: string): void {
  sessionStorage.removeItem(STORAGE_PREFIX + reference);
}
