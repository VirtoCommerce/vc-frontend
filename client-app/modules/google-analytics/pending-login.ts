import { sendEvent } from "./utils";

const PENDING_LOGIN_KEY = "vc-google-analytics-pending-login";

// Covers the sign-in's own reload; "reopen closed tab" restores session storage, and must not replay it later.
const PENDING_LOGIN_MAX_AGE_MS = 2 * 60 * 1000;

type PendingLoginType = { method: string; params?: Gtag.CustomParams; savedAt: number };

/**
 * A successful sign-in reloads the page right after reporting it, so a `login` sent now races the unload — and carries
 * the signed-out identity, because the new user's properties are applied by the next page. That page sends it.
 */
export function deferLogin(method: string, params?: Gtag.CustomParams): void {
  const pending: PendingLoginType = { method, params, savedAt: Date.now() };

  try {
    sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending));
  } catch {
    // No storage to carry it across the reload: the old race is still better than no event at all.
    sendEvent("login", { ...params, method });
  }
}

/**
 * Read, remove, then send: removed before anything can fail, so a login is sent at most once — by the tab that signed
 * in (session storage is per tab), and only when that page really is signed in.
 */
export function sendPendingLogin(isAuthenticated: boolean): void {
  let pending: PendingLoginType | undefined;

  try {
    const stored = sessionStorage.getItem(PENDING_LOGIN_KEY);
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
    pending = stored ? (JSON.parse(stored) as PendingLoginType) : undefined;
  } catch {
    return;
  }

  // A corrupt timestamp makes the age NaN, which is not fresh either.
  const isFresh = Date.now() - (pending?.savedAt ?? Number.NaN) <= PENDING_LOGIN_MAX_AGE_MS;

  if (!pending || !isAuthenticated || !isFresh) {
    return;
  }

  sendEvent("login", { ...pending.params, method: pending.method });
}
