import { SESSION_IDENTITY_STORAGE_KEY, SESSION_STORAGE_KEY } from "./constants";
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

// With storage blocked the session lives as long as the page does, which still groups the events of that page.
let sessionWithoutStorage: SessionType | undefined;

const UTM_NAMES = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * One session per tab, kept in session storage so the reload a sign-in or an organization switch makes stays in it.
 */
export function getSession(getLandingPath: () => string = () => location.pathname): SessionType {
  const stored = readSession() ?? sessionWithoutStorage;

  if (stored) {
    return stored;
  }

  const session = startSession(getLandingPath());

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    sessionWithoutStorage = session;
  }

  return session;
}

/**
 * True the first time the session is seen under this identity. A visit is counted for whoever makes it, and a
 * session that starts signed out is not yet anybody's: it starts again, for the customer and their organization,
 * once they sign in or switch organization.
 */
export function startSessionFor(identityKey: string): boolean {
  try {
    if (sessionStorage.getItem(SESSION_IDENTITY_STORAGE_KEY) === identityKey) {
      return false;
    }

    sessionStorage.setItem(SESSION_IDENTITY_STORAGE_KEY, identityKey);
  } catch {
    // No storage to remember it in: reported once per page load.
  }

  return true;
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

function startSession(landingPath: string): SessionType {
  const params = new URLSearchParams(location.search);
  const session: SessionType = {
    id: createId(),
    landing_path: landingPath,
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
