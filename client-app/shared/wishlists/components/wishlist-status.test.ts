import { render, cleanup } from "@testing-library/vue";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import WishlistStatus from "./wishlist-status.vue";
import type { SharingSettingType } from "@/core/api/graphql/types";
import "@testing-library/jest-dom/vitest";

// Echoes the key, and the interpolation with it, so a test can see whether the count was offered at all.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, named?: Record<string, unknown>, plural?: number) =>
      named ? `${key}|${JSON.stringify(named)}|${plural}` : key,
  }),
}));

// Core must not know any contributed scope by name.
const TARGETED_SCOPE = "TargetedTestScope";
const TARGETED_STATUS_KEY = "test_module.targeted_scope.status";

// A contributed scope is by definition absent from the generated enum, hence the cast.
function renderStatus(sharingSetting: { scope: string; isOwner: boolean; targets?: { id: string }[] }) {
  return render(WishlistStatus, {
    props: { sharingSetting: { id: "k", ...sharingSetting } as unknown as SharingSettingType },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });
}

beforeAll(() => {
  useWishlistSharingScopes().registerSharingScope({
    scope: TARGETED_SCOPE,
    labelKey: "test_module.targeted_scope.label",
    statusKey: TARGETED_STATUS_KEY,
  });
});

afterEach(() => {
  cleanup();
});

describe("WishlistStatus", () => {
  it("calls a private list private", () => {
    const status = renderStatus({ scope: WishlistScopeType.Private, isOwner: true });

    expect(status.getByText("shared.wishlists.status.private")).toBeInTheDocument();
  });

  it("uses the provider's own wording for a contributed scope the caller owns", () => {
    const status = renderStatus({ scope: TARGETED_SCOPE, isOwner: true });

    expect(status.getByText(TARGETED_STATUS_KEY)).toBeInTheDocument();
  });

  it("offers the recipient count to a scope that resolved its targets", () => {
    const status = renderStatus({
      scope: TARGETED_SCOPE,
      isOwner: true,
      targets: [{ id: "org-1" }, { id: "org-2" }, { id: "org-3" }],
    });

    expect(status.getByText(`${TARGETED_STATUS_KEY}|{"count":3}|3`)).toBeInTheDocument();
  });

  it("leaves the wording alone for a viewer the backend resolves no targets for", () => {
    // Only the owner of a targeted scope gets `targets`, so nobody else can be counted.
    const status = renderStatus({ scope: TARGETED_SCOPE, isOwner: true, targets: [] });

    expect(status.getByText(TARGETED_STATUS_KEY)).toBeInTheDocument();
  });

  it("tells a recipient the list was shared with them, not who it was published to", () => {
    const status = renderStatus({ scope: TARGETED_SCOPE, isOwner: false });

    expect(status.getByText("shared.wishlists.status.shared_with_me")).toBeInTheDocument();
  });

  it("falls back to the generic wording for a scope that contributes none", () => {
    const status = renderStatus({ scope: WishlistScopeType.AnyoneAnonymous, isOwner: true });

    expect(status.getByText("shared.wishlists.status.shared")).toBeInTheDocument();
  });

  it("treats an organization list as shared for every member, not just its owner", () => {
    const status = renderStatus({ scope: WishlistScopeType.Organization, isOwner: false });

    expect(status.getByText("shared.wishlists.status.shared")).toBeInTheDocument();
  });
});
