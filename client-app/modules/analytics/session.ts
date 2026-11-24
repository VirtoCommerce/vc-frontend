import { SESSION_STORAGE_KEY } from "./constants";
import { createId } from "./utils";

/** How the visitor arrived. Read once, when the session starts: a later page would describe the site itself. */
export type SessionType = {
  id: string;
  landing_path: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const UTM_NAMES = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * One session per tab, kept in session storage so the reload a sign-in or an organization switch makes stays in it.
 * `isNew` is true for the call that started it.
 */
export function getSession(): { session: SessionType; isNew: boolean } {
  const stored = readSession();

  if (stored) {
    return { session: stored, isNew: false };
  }

  const session = startSession();

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // No storage: every page load is its own session, which still groups the events of that page.
  }

  return { session, isNew: true };
}

function readSession(): SessionType | undefined {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "null") as Partial<SessionType> | null;

    if (typeof session?.id === "string" && typeof session.landing_path === "string") {
      return session as SessionType;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function startSession(): SessionType {
  const params = new URLSearchParams(location.search);
  const session: SessionType = {
    id: createId(),
    landing_path: location.pathname,
    referrer: getExternalReferrer(),
  };

  for (const name of UTM_NAMES) {
    const value = params.get(name)?.slice(0, 128);

    if (value) {
      session[name] = value;
    }
  }

  return session;
}

/** Origin and path only: a query string of another site is not ours to store. */
function getExternalReferrer(): string | undefined {
  try {
    const referrer = new URL(document.referrer);

    return referrer.origin === location.origin ? undefined : `${referrer.origin}${referrer.pathname}`;
  } catch {
    return undefined;
  }
}
