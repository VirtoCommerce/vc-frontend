import { beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "./useWishlistSharingScopes";

const mocks = vi.hoisted(() => ({ warn: vi.fn() }));

vi.mock("@/core/utilities", () => ({ Logger: { warn: mocks.warn, error: vi.fn() } }));

// `createGlobalState`: one registry for the whole file, exactly as the app has one for the whole session.
const { sharingScopes, registerSharingScope, getSharingScope } = useWishlistSharingScopes();

beforeEach(() => {
  mocks.warn.mockReset();
});

function occurrencesOf(scope: string) {
  return sharingScopes.value.filter((registered) => registered.scope === scope);
}

describe("registerSharingScope", () => {
  it("takes a scope the registry does not carry yet", () => {
    registerSharingScope({ scope: "Customer", labelKey: "customer.label", order: 30 });

    expect(getSharingScope("Customer")?.labelKey).toBe("customer.label");
  });

  it("seats a contributed scope by the order it asked for", () => {
    const ids = sharingScopes.value.map((scope) => scope.scope);

    expect(ids).toEqual([
      WishlistScopeType.Private,
      WishlistScopeType.Organization,
      "Customer",
      WishlistScopeType.AnyoneAnonymous,
    ]);
  });

  it("refuses a second module claiming an id that is already contributed", () => {
    registerSharingScope({ scope: "Customer", labelKey: "customer.hijacked" });

    expect(getSharingScope("Customer")?.labelKey).toBe("customer.label");
    expect(occurrencesOf("Customer")).toHaveLength(1);
    expect(mocks.warn).toHaveBeenCalledOnce();
  });

  it("refuses an id core owns, which the contributed list alone cannot see", () => {
    registerSharingScope({ scope: WishlistScopeType.Private, labelKey: "private.hijacked" });

    // Two tabs would share one radio group, and `getSharingScope` would resolve whichever sorted first.
    expect(occurrencesOf(WishlistScopeType.Private)).toHaveLength(1);
    expect(getSharingScope(WishlistScopeType.Private)?.labelKey).not.toBe("private.hijacked");
    expect(mocks.warn).toHaveBeenCalledOnce();
  });
});
