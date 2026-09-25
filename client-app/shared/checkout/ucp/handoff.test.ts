import { beforeEach, describe, expect, test, vi } from "vitest";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { globals, setGlobals } from "@/core/globals";
import { applyUcpHandoffBuyer, restoreUcpHandoffCart, UcpHandoffRestoreError } from "./handoff";

const auth = vi.hoisted(
  (): {
    headers: { value: Record<string, string> };
    expired: boolean;
    refresh: ReturnType<typeof vi.fn>;
  } => ({
    headers: { value: {} },
    expired: false,
    refresh: vi.fn(),
  }),
);

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({
    headers: auth.headers,
    isExpired: () => auth.expired,
    refresh: auth.refresh,
  }),
}));

describe("UCP checkout handoff", () => {
  beforeEach(() => {
    auth.headers.value = {};
    auth.expired = false;
    auth.refresh.mockReset();
    localStorage.clear();
    setGlobals({ userId: undefined });
    vi.unstubAllGlobals();
  });

  test("restores an authenticated session with the existing Platform bearer and cookies", async () => {
    auth.headers.value = { Authorization: "Bearer platform-token" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            checkout: { cart_id: "authenticated-cart", buyer: { id: "contact-1" }, cart: { buyer_id: "user-1" } },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await restoreUcpHandoffCart("authenticated-session");

    expect(result).toEqual({ cartId: "authenticated-cart" });
    expect(result.anonymousBuyerId).toBeUndefined();
    applyUcpHandoffBuyer(result.anonymousBuyerId);
    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBeNull();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/ucp/v1/internal/handoff/restore",
      expect.objectContaining({ credentials: "omit" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/ucp/v1/internal/handoff/restore",
      expect.objectContaining({ credentials: "include" }),
    );
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    expect((request.headers as Headers).get("Authorization")).toBe("Bearer platform-token");
  });

  test("stores only a server-confirmed anonymous buyer as the storefront anonymous user", () => {
    applyUcpHandoffBuyer();
    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBeNull();
    expect(globals.userId).toBeUndefined();

    applyUcpHandoffBuyer("ucp-anonymous-0123456789abcdef0123456789abcdef");
    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBe("ucp-anonymous-0123456789abcdef0123456789abcdef");
    expect(globals.userId).toBe("ucp-anonymous-0123456789abcdef0123456789abcdef");
  });

  test("surfaces 401 so the router can use the existing sign-in flow", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const error = await restoreUcpHandoffCart("requires-platform-login").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(UcpHandoffRestoreError);
    expect((error as UcpHandoffRestoreError).status).toBe(401);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("does not replace a signed-in user's identity with an anonymous handoff buyer", () => {
    auth.headers.value = { Authorization: "Bearer platform-token" };
    localStorage.setItem(USER_ID_LOCAL_STORAGE, "real-user");
    setGlobals({ userId: "real-user" });
    applyUcpHandoffBuyer("ucp-anonymous-other");
    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBe("real-user");
    expect(globals.userId).toBe("real-user");
  });

  test("reuses a successful restore sequentially without consuming the token twice", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ checkout: { cart_id: "cached-cart" } })));
    vi.stubGlobal("fetch", fetchMock);
    const first = await restoreUcpHandoffCart("sequential-session");
    await expect(restoreUcpHandoffCart("sequential-session")).resolves.toBe(first);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test.each([400, 403, 500])("preserves status %s and does not retry it with authentication", async (status) => {
    auth.headers.value = { Authorization: "Bearer platform-token" };
    const fetchMock = vi.fn().mockResolvedValue(new Response("Failure", { status }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(restoreUcpHandoffCart(`failure-${status}`)).rejects.toMatchObject({ status });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("clears a failed pending request so a later attempt can succeed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ checkout: { cart_id: "retry-cart" } })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(restoreUcpHandoffCart("retry-after-failure")).rejects.toMatchObject({ status: 503 });
    await expect(restoreUcpHandoffCart("retry-after-failure")).resolves.toMatchObject({ cartId: "retry-cart" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("refreshes an expired Platform token before restore", async () => {
    auth.expired = true;
    auth.refresh.mockImplementation(async () => {
      auth.headers.value = { Authorization: "Bearer refreshed-token" };
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ checkout: { cart_id: "refreshed-cart" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await restoreUcpHandoffCart("expired-token-session");

    expect(auth.refresh).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    expect((request.headers as Headers).get("Authorization")).toBe("Bearer refreshed-token");
  });

  test("deduplicates concurrent restore calls for a single-use handoff session", async () => {
    let resolveFetch!: (response: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = restoreUcpHandoffCart("single-use-session");
    const second = restoreUcpHandoffCart("single-use-session");

    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFetch(
      new Response(
        JSON.stringify({
          anonymous_buyer_id: "ucp-anonymous-0123456789abcdef0123456789abcdef",
          checkout: { cart_id: "anonymous-cart" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(Promise.all([first, second])).resolves.toEqual([
      { cartId: "anonymous-cart", anonymousBuyerId: "ucp-anonymous-0123456789abcdef0123456789abcdef" },
      { cartId: "anonymous-cart", anonymousBuyerId: "ucp-anonymous-0123456789abcdef0123456789abcdef" },
    ]);
  });
});
