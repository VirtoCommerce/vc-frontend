import { render, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import SharedList from "./shared-list.vue";
import type { CartType, LineItemType, WishlistType } from "@/core/api/graphql/types";
import type { IWishlistSharingScopeType } from "@/shared/wishlists";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

// This page must not know any contributed scope by name.
const SHOPPABLE_SCOPE = "ShoppableTestScope";
const PLAIN_SCOPE = "PlainTestScope";

// Everything a vi.mock factory reaches for must live in the hoisted block — the factories run before this
// module's own top-level bindings exist.
const mocks = await vi.hoisted(async () => {
  const { ref, defineComponent: define, h: createElement } = await import("vue");

  /** Captures what the page passes down, and lets a test fire the add-to-cart intent for a given item. */
  const lineItemsSpy = {
    props: {} as Record<string, unknown>,
    emit: undefined as undefined | ((item: unknown, quantity: number) => void),
  };

  const WishlistLineItems = define({
    props: {
      items: { type: Array, default: () => [] },
      pendingItems: { type: Object, default: () => ({}) },
      editable: { type: Boolean, default: true },
      addableToCart: { type: Boolean, default: false },
      navigatable: { type: Boolean, default: true },
    },
    emits: ["update:cartItem", "linkClick"],
    setup(props, { emit }) {
      lineItemsSpy.emit = (item, quantity) => emit("update:cartItem", item, quantity);

      return () => {
        lineItemsSpy.props = { ...props };
        return createElement("div", { "data-test-id": "line-items" });
      };
    },
  });

  const Empty = define({ setup: () => () => createElement("div") });

  return {
    list: ref<WishlistType | undefined>(undefined),
    listLoading: ref(false),
    cart: ref<CartType | undefined>(undefined),
    fetchSharedWishList: vi.fn(),
    addToCart: vi.fn(),
    changeItemQuantity: vi.fn(),
    scopes: ref<Record<string, Partial<IWishlistSharingScopeType>>>({}),
    canRenderExtensionPoint: vi.fn(() => false),
    analytics: vi.fn(),
    trackAddItemToCart: vi.fn(),
    pushHistoricalEvent: vi.fn(),
    lineItemsSpy,
    WishlistLineItems,
    Empty,
  };
});

const lineItemsSpy = mocks.lineItemsSpy;

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: mocks.analytics }),
  useHistoricalEvents: () => ({ pushHistoricalEvent: mocks.pushHistoricalEvent }),
  usePageHead: vi.fn(),
}));

vi.mock("@/core/composables/useAnalyticsUtils", () => ({
  useAnalyticsUtils: () => ({ trackAddItemToCart: mocks.trackAddItemToCart }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getModuleSettings: () => ({ continue_shopping_link: "" }) }),
}));

// Minimal stand-in: the page only needs the identity fields its cart handler matches on.
vi.mock("@/core/utilities", () => ({
  prepareLineItem: (item: LineItemType, countInCart?: number) => ({ ...item, countInCart }),
}));

vi.mock("@/shared/cart", () => ({
  useShortCart: () => ({
    cart: mocks.cart,
    addToCart: mocks.addToCart,
    changeItemQuantity: mocks.changeItemQuantity,
  }),
}));

vi.mock("@/shared/wishlists", () => ({
  useWishlists: () => ({
    list: mocks.list,
    listLoading: mocks.listLoading,
    fetchSharedWishList: mocks.fetchSharedWishList,
  }),
  useWishlistSharingScopes: () => ({
    getSharingScope: (scope?: string | null) => (scope ? mocks.scopes.value[scope] : undefined),
  }),
  WishlistLineItems: mocks.WishlistLineItems,
  WishlistSummary: mocks.Empty,
  WishlistProductsSkeleton: mocks.Empty,
}));

function lineItem(overrides: Partial<LineItemType> = {}): LineItemType {
  return {
    id: "li-1",
    productId: "prod-1",
    sku: "SKU-1",
    quantity: 1,
    name: "Widget",
    product: { id: "prod-1" },
    ...overrides,
  } as LineItemType;
}

function wishlist(scope: string, items: LineItemType[] = [lineItem()]): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    items,
    sharingSetting: { id: "sharing-key-1", scope, isOwner: false },
  } as unknown as WishlistType;
}

function cartWith(items: { id: string; productId: string; sku: string; quantity: number }[]): CartType {
  return { items } as CartType;
}

function renderPage() {
  return render(SharedList, {
    props: { sharingKey: "sharing-key-1" },
    global: {
      mocks: {
        $t: (key: string) => key,
        $canRenderExtensionPoint: mocks.canRenderExtensionPoint,
      },
      stubs: {
        VcContainer: { template: "<div><slot /></div>" },
        VcTypography: { template: "<div><slot /></div>" },
        VcLayout: { template: "<div><slot /><slot name='sidebar' /></div>" },
        VcWidget: { template: "<div><slot /></div>" },
        // Records that the page offered the socket, without pulling in any provider.
        ExtensionPoint: { template: '<div data-test-id="extension-point" />' },
        VcPagination: true,
        VcEmptyView: true,
        VcButton: true,
      },
    },
  });
}

/** The page loads the list inside a watchEffect, so give it a tick to settle before asserting. */
async function renderSettled() {
  const result = renderPage();
  await nextTick();
  await nextTick();
  return result;
}

beforeEach(() => {
  mocks.list.value = undefined;
  mocks.listLoading.value = false;
  mocks.cart.value = undefined;
  mocks.fetchSharedWishList.mockReset();
  mocks.addToCart.mockReset();
  mocks.changeItemQuantity.mockReset();
  mocks.analytics.mockReset();
  mocks.trackAddItemToCart.mockReset();
  mocks.pushHistoricalEvent.mockReset().mockResolvedValue(undefined);
  mocks.canRenderExtensionPoint.mockReset().mockReturnValue(false);
  mocks.scopes.value = {
    [SHOPPABLE_SCOPE]: { scope: SHOPPABLE_SCOPE, labelKey: "", shoppable: true },
    [PLAIN_SCOPE]: { scope: PLAIN_SCOPE, labelKey: "" },
  };
  lineItemsSpy.props = {};
  lineItemsSpy.emit = undefined;
});

afterEach(() => {
  cleanup();
});

describe("SharedList", () => {
  describe("where a list came from", () => {
    it("offers the provenance socket to whichever module claims the list", async () => {
      mocks.canRenderExtensionPoint.mockReturnValue(true);
      mocks.list.value = wishlist(SHOPPABLE_SCOPE);

      const page = await renderSettled();

      expect(page.getByTestId("extension-point")).toBeInTheDocument();
      // The provider decides from the sharing setting, so that is what it must be asked with.
      expect(mocks.canRenderExtensionPoint).toHaveBeenCalledWith(
        "sharedList",
        expect.any(String),
        expect.objectContaining({ scope: SHOPPABLE_SCOPE }),
      );
    });

    it("shows nothing there when no module claims it", async () => {
      mocks.list.value = wishlist(PLAIN_SCOPE);

      const page = await renderSettled();

      expect(page.queryByTestId("extension-point")).toBeNull();
    });
  });

  describe("whether the list can be shopped", () => {
    it("allows adding to cart when the scope declares the list shoppable", async () => {
      mocks.list.value = wishlist(SHOPPABLE_SCOPE);

      await renderSettled();

      expect(lineItemsSpy.props.addableToCart).toBe(true);
      // The viewer does not own the list, so it must stay read-only regardless.
      expect(lineItemsSpy.props.editable).toBe(false);
    });

    it("does not allow it for a scope that declares nothing", async () => {
      mocks.list.value = wishlist(PLAIN_SCOPE);

      await renderSettled();

      expect(lineItemsSpy.props.addableToCart).toBe(false);
    });

    it("does not allow it for a scope the registry does not know", async () => {
      mocks.list.value = wishlist("SomeRemovedScope");

      await renderSettled();

      expect(lineItemsSpy.props.addableToCart).toBe(false);
    });
  });

  describe("adding to the viewer's own cart", () => {
    async function shoppableList(items?: LineItemType[]) {
      mocks.list.value = wishlist(SHOPPABLE_SCOPE, items);
      await renderSettled();
    }

    it("adds the product when it is not in the cart yet", async () => {
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-1" }, 3);
      await nextTick();

      expect(mocks.addToCart).toHaveBeenCalledWith("prod-1", 3);
      expect(mocks.changeItemQuantity).not.toHaveBeenCalled();
    });

    it("changes the quantity of the existing cart line instead of adding a duplicate", async () => {
      mocks.cart.value = cartWith([{ id: "cart-li-1", productId: "prod-1", sku: "SKU-1", quantity: 1 }]);
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-1" }, 5);
      await nextTick();

      expect(mocks.changeItemQuantity).toHaveBeenCalledWith("cart-li-1", 5);
      expect(mocks.addToCart).not.toHaveBeenCalled();
    });

    it("reports the conversion when the product is genuinely added", async () => {
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-1" }, 3);
      await nextTick();

      expect(mocks.trackAddItemToCart).toHaveBeenCalledWith(expect.objectContaining({ id: "prod-1" }), 3);
      expect(mocks.pushHistoricalEvent).toHaveBeenCalledWith({ eventType: "addToCart", productId: "prod-1" });
    });

    it("does not report a conversion for a quantity change on an existing cart line", async () => {
      mocks.cart.value = cartWith([{ id: "cart-li-1", productId: "prod-1", sku: "SKU-1", quantity: 1 }]);
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-1" }, 5);
      await nextTick();

      expect(mocks.changeItemQuantity).toHaveBeenCalledOnce();
      expect(mocks.trackAddItemToCart).not.toHaveBeenCalled();
      expect(mocks.pushHistoricalEvent).not.toHaveBeenCalled();
    });

    it("does nothing when the requested quantity already matches the cart", async () => {
      mocks.cart.value = cartWith([{ id: "cart-li-1", productId: "prod-1", sku: "SKU-1", quantity: 4 }]);
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-1" }, 4);
      await nextTick();

      expect(mocks.addToCart).not.toHaveBeenCalled();
      expect(mocks.changeItemQuantity).not.toHaveBeenCalled();
    });

    it("ignores an item that is not part of the shared list", async () => {
      await shoppableList();

      lineItemsSpy.emit!({ productId: "prod-unknown" }, 2);
      await nextTick();

      expect(mocks.addToCart).not.toHaveBeenCalled();
    });

    it("never saves a list quantity — the viewer cannot write to someone else's list", async () => {
      await shoppableList();

      // `update:listItem` is the editable-mode channel; this page must not be wired to it at all.
      expect(lineItemsSpy.props.editable).toBe(false);
    });
  });
});
