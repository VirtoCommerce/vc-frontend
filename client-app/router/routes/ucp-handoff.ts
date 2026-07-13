import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { setGlobals } from "@/core/globals";

export type UcpHandoffRestoreType = {
  cartId: string;
  buyerId?: string;
};

const ucpHandoffRestoreCache = new Map<string, UcpHandoffRestoreType>();

export function applyUcpHandoffBuyer(buyerId?: string): void {
  if (!buyerId) {
    return;
  }

  localStorage.setItem(USER_ID_LOCAL_STORAGE, buyerId);
  setGlobals({ userId: buyerId });
}

function cacheUcpHandoffRestore(ucpSession: string, value: UcpHandoffRestoreType): void {
  ucpHandoffRestoreCache.set(ucpSession, value);
}

export async function restoreUcpHandoffCart(ucpSession: string): Promise<UcpHandoffRestoreType> {
  const headers = new Headers({
    "content-type": "application/json",
    accept: "application/json",
  });

  const response = await fetch("/ucp/v1/internal/handoff/restore", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    headers,
    body: JSON.stringify({ ucp_session: ucpSession }),
  });

  if (!response.ok) {
    if (ucpHandoffRestoreCache.has(ucpSession)) {
      return ucpHandoffRestoreCache.get(ucpSession)!;
    }

    const details = await response.text().catch(() => "");
    throw new Error(`Unable to restore UCP handoff session. Status: ${response.status}. ${details}`);
  }

  const payload = (await response.json()) as {
    checkout?: {
      cart_id?: string;
      buyer?: { id?: string };
      cart?: { id?: string; buyer_id?: string };
    };
  };
  const cartId = payload.checkout?.cart_id ?? payload.checkout?.cart?.id;
  const buyerId = payload.checkout?.buyer?.id ?? payload.checkout?.cart?.buyer_id;

  if (!cartId) {
    throw new Error("UCP handoff session does not include cart id.");
  }

  const restore = { cartId, buyerId };
  cacheUcpHandoffRestore(ucpSession, restore);

  return restore;
}
