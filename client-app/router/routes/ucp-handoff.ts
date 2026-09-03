import { useAuth } from "@/core/composables/useAuth";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { setGlobals } from "@/core/globals";

export type UcpHandoffRestoreType = {
  cartId: string;
  anonymousBuyerId?: string;
};

const ucpHandoffRestoreCache = new Map<string, UcpHandoffRestoreType>();
const ucpHandoffRestoreRequests = new Map<string, Promise<UcpHandoffRestoreType>>();

export class UcpHandoffRestoreError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "UcpHandoffRestoreError";
  }
}

export function applyUcpHandoffBuyer(anonymousBuyerId?: string): void {
  if (!anonymousBuyerId) {
    return;
  }

  localStorage.setItem(USER_ID_LOCAL_STORAGE, anonymousBuyerId);
  setGlobals({ userId: anonymousBuyerId });
}

function cacheUcpHandoffRestore(ucpSession: string, value: UcpHandoffRestoreType): void {
  ucpHandoffRestoreCache.set(ucpSession, value);
}

export async function restoreUcpHandoffCart(ucpSession: string): Promise<UcpHandoffRestoreType> {
  const cached = ucpHandoffRestoreCache.get(ucpSession);
  if (cached) {
    return cached;
  }

  const pending = ucpHandoffRestoreRequests.get(ucpSession);
  if (pending) {
    return pending;
  }

  const request = requestUcpHandoffRestoreWithFallback(ucpSession);
  ucpHandoffRestoreRequests.set(ucpSession, request);

  try {
    return await request;
  } finally {
    if (ucpHandoffRestoreRequests.get(ucpSession) === request) {
      ucpHandoffRestoreRequests.delete(ucpSession);
    }
  }
}

async function requestUcpHandoffRestoreWithFallback(ucpSession: string): Promise<UcpHandoffRestoreType> {
  try {
    return await requestUcpHandoffRestore(ucpSession, false);
  } catch (error) {
    if (!(error instanceof UcpHandoffRestoreError) || error.status !== 401) {
      throw error;
    }
  }

  return requestUcpHandoffRestore(ucpSession, true);
}

async function requestUcpHandoffRestore(ucpSession: string, authenticated: boolean): Promise<UcpHandoffRestoreType> {
  const { headers: authHeaders, isExpired, refresh } = useAuth();
  if (authenticated && isExpired()) {
    await refresh();
  }

  const headers = new Headers({
    "content-type": "application/json",
    accept: "application/json",
  });
  if (authenticated) {
    Object.entries(authHeaders.value).forEach(([name, value]) => headers.set(name, value));
  }

  const response = await fetch("/ucp/v1/internal/handoff/restore", {
    method: "POST",
    credentials: authenticated ? "include" : "omit",
    cache: "no-store",
    headers,
    body: JSON.stringify({ ucp_session: ucpSession }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new UcpHandoffRestoreError(
      `Unable to restore UCP handoff session. Status: ${response.status}. ${details}`,
      response.status,
    );
  }

  const payload = (await response.json()) as {
    anonymous_buyer_id?: string;
    checkout?: {
      cart_id?: string;
      buyer?: { id?: string };
      cart?: { id?: string; buyer_id?: string };
    };
  };
  const cartId = payload.checkout?.cart_id ?? payload.checkout?.cart?.id;

  if (!cartId) {
    throw new Error("UCP handoff session does not include cart id.");
  }

  const restore = { cartId, anonymousBuyerId: payload.anonymous_buyer_id };
  cacheUcpHandoffRestore(ucpSession, restore);

  return restore;
}
