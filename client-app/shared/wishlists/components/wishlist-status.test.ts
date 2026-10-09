import { render, cleanup } from "@testing-library/vue";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { createIntlPluralRule } from "@/i18n";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import WishlistStatus from "./wishlist-status.vue";
import type { SharingSettingType } from "@/core/api/graphql/types";
import "@testing-library/jest-dom/vitest";

// Core must not know any contributed scope by name.
const TARGETED_SCOPE = "TargetedTestScope";
const TARGETED_STATUS_KEY = "test_module.targeted_scope.status";

/**
 * The real message compiler and the app's own plural rule, not a `t` echo: a count is rendered through a
 * pluralised message here, and an echo cannot tell a singular form from a plural one.
 */
const messages = {
  en: {
    shared: {
      wishlists: {
        status: {
          private: "Private",
          shared: "Shared",
          shared_with_me: "Shared with me",
        },
      },
    },
    test_module: {
      targeted_scope: {
        status: "Shared with {count} customer | Shared with {count} customers",
      },
    },
  },
};

// A contributed scope is absent from the generated enum, hence the cast.
function renderStatus(sharingSetting: { scope: string; isOwner: boolean; targets?: { id: string }[] }) {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages,
    pluralRules: { en: createIntlPluralRule("en") },
  });

  return render(WishlistStatus, {
    props: { sharingSetting: { id: "k", ...sharingSetting } as unknown as SharingSettingType },
    global: {
      plugins: [i18n],
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

    expect(status.getByText("Private")).toBeInTheDocument();
  });

  it("uses the provider's own wording for a contributed scope the caller owns", () => {
    const status = renderStatus({
      scope: TARGETED_SCOPE,
      isOwner: true,
      targets: [{ id: "org-1" }],
    });

    expect(status.getByText("Shared with 1 customer")).toBeInTheDocument();
  });

  it("counts the recipients a scope resolved", () => {
    const status = renderStatus({
      scope: TARGETED_SCOPE,
      isOwner: true,
      targets: [{ id: "org-1" }, { id: "org-2" }, { id: "org-3" }],
    });

    expect(status.getByText("Shared with 3 customers")).toBeInTheDocument();
  });

  it("says zero rather than falling through to the singular form when nobody is left", () => {
    // `t(key)` with no plural argument resolves to the singular, so an unguarded zero reads "Shared with 1 customer".
    const status = renderStatus({ scope: TARGETED_SCOPE, isOwner: true, targets: [] });

    expect(status.getByText("Shared with 0 customers")).toBeInTheDocument();
  });

  it("tells a recipient the list was shared with them, not who it was published to", () => {
    const status = renderStatus({ scope: TARGETED_SCOPE, isOwner: false });

    expect(status.getByText("Shared with me")).toBeInTheDocument();
  });

  it("falls back to the generic wording for a scope that contributes none", () => {
    const status = renderStatus({ scope: WishlistScopeType.AnyoneAnonymous, isOwner: true });

    expect(status.getByText("Shared")).toBeInTheDocument();
  });

  it("treats an organization list as shared for every member, not just its owner", () => {
    const status = renderStatus({ scope: WishlistScopeType.Organization, isOwner: false });

    expect(status.getByText("Shared")).toBeInTheDocument();
  });
});
