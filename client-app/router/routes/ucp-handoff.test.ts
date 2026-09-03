import { beforeEach, describe, expect, test, vi } from "vitest";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { globals, setGlobals } from "@/core/globals";
import { applyUcpHandoffBuyer, restoreUcpHandoffCart, UcpHandoffRestoreError } from "./ucp-handoff";

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
        new Response(JSON.stringify({ checkout: { cart_id: "authenticated-cart" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await restoreUcpHandoffCart("authenticated-session");

    expect(result).toEqual({ cartId: "authenticated-cart" });
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
